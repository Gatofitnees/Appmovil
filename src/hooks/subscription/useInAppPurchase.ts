import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Purchases, PurchasesPackage, CustomerInfo } from '@revenuecat/purchases-capacitor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getRevenueCatApiKey } from '@/lib/revenuecat-keys';

interface InAppProduct {
  id: string;
  displayName: string;
  displayPrice: string;
  description: string;
  packageType: string;
}

interface PurchaseResult {
  success: boolean;
  error?: string;
  customerInfo?: CustomerInfo;
}

interface SubscriptionData {
  user_id: string;
  status: 'active' | 'cancelled' | 'expired';
  plan_type: 'monthly' | 'yearly';
  payment_method?: 'paypal' | 'app_store' | 'google_play';
  platform?: 'ios' | 'android' | 'web';
  revenuecat_customer_id: string;
  store_transaction_id?: string;
  receipt_data?: string;
}

export const useInAppPurchase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<InAppProduct[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const { toast } = useToast();

  // Track configuration across hook instances
  let purchasesConfigured = (globalThis as any).__rcConfigured === true;
  let lastPremiumState: boolean | undefined = (globalThis as any).__rcLastPremiumState;

  // Get current platform
  const getPlatform = useCallback((): 'ios' | 'android' | 'web' => {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'web';
  }, []);

  // Get payment method based on platform
  const getPaymentMethod = useCallback((): 'app_store' | 'google_play' | 'paypal' => {
    const platform = getPlatform();
    if (platform === 'ios') return 'app_store';
    if (platform === 'android') return 'google_play';
    return 'paypal';
  }, [getPlatform]);

  // Initialize RevenueCat SDK
  const initializeRevenueCat = useCallback(async () => {
    try {
      const platform = getPlatform();

      // Skip on web
      if (platform === 'web') {
        console.log('⚠️ Skipping RevenueCat on web platform');
        return;
      }

      if ((globalThis as any).__rcConfigured) {
        return;
      }

      // Get API key from separate module to prevent Vite dead-code elimination
      const REVENUECAT_API_KEY = getRevenueCatApiKey(platform);

      if (!REVENUECAT_API_KEY) {
        console.warn('⚠️ RevenueCat SDK key no encontrada en las variables de entorno');
      }

      if (REVENUECAT_API_KEY?.startsWith('test_')) {
        console.warn('⚠️ Usando Test Store API key de RevenueCat. Asegúrate de tener productos del Test Store en el offering o usa la clave iOS `appl_...`.');
      }

      const keyPreview = REVENUECAT_API_KEY ? `${REVENUECAT_API_KEY.slice(0, 6)}…` : 'undefined';
      console.log(`📡 RevenueCat configure | platform=${platform} | key=${keyPreview}`);

      await Purchases.configure({
        apiKey: REVENUECAT_API_KEY,
        appUserID: undefined,
      });

      // Sync user with RevenueCat
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Purchases.logIn({
          appUserID: user.id,
        });
        console.log(`✅ RevenueCat initialized for user ${user.id}`);
      }

      // Attach a single global listener for customer info updates
      if (!(globalThis as any).__rcCustomerInfoListener) {
        Purchases.addCustomerInfoUpdateListener(async (customerInfo: CustomerInfo) => {
          try {
            const nowPremium = !!customerInfo.entitlements.active.premium;
            const wasPremium: boolean | undefined = (globalThis as any).__rcLastPremiumState;
            (globalThis as any).__rcLastPremiumState = nowPremium;

            // CRITICAL: Only fire restore event if wasPremium is EXPLICITLY false (not undefined)
            // This prevents auto-activation on first app launch when user has Sandbox subscriptions
            if (wasPremium === false && nowPremium === true) {
              console.log('🔄 Premium status changed from false to true - firing restore event');
              const activeIds = (customerInfo as any)?.activeSubscriptions as string[] | undefined;
              const planIsYearly = activeIds?.some(id => id?.includes('ANUAL') || id?.toLowerCase()?.includes('year') || id?.includes('influencer')) ?? false;
              const planType = planIsYearly ? 'yearly' : 'monthly';
              const planName = planIsYearly ? 'Suscripción Anual Premium' : 'Suscripción Mensual Premium';
              window.dispatchEvent(new CustomEvent('iap:subscription-restored', { detail: { planType, planName, mode: 'restore' } }));
            } else if (wasPremium === undefined && nowPremium === true) {
              console.log('⚠️ First launch detected with active subscription - NOT firing restore event to prevent auto-activation');
            }
          } catch (e) {
            // noop
          }
        });
        (globalThis as any).__rcCustomerInfoListener = true;
      }

      (globalThis as any).__rcConfigured = true;
      purchasesConfigured = true;
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  }, [getPlatform]);

  // Ensure SDK is configured before any call
  const ensureConfigured = useCallback(async () => {
    const platform = getPlatform();
    if (platform === 'web') return;
    if (!(globalThis as any).__rcConfigured) {
      await initializeRevenueCat();
    }
  }, [getPlatform, initializeRevenueCat]);

  // Configure once when hook mounts on native
  useEffect(() => {
    void ensureConfigured();
  }, [ensureConfigured]);

  // Load available products
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const platform = getPlatform();

      if (platform === 'web') {
        console.log('Skipping product loading on web');
        return;
      }

      await ensureConfigured();
      const offerings = await Purchases.getOfferings();

      // En Android, intenta cargar el offering 'android' en lugar de 'default'
      let currentOffering = offerings.current;
      if (platform === 'android' && offerings.all?.['android']) {
        currentOffering = offerings.all['android'];
        console.log('📱 Using Android offering');
      } else if (platform === 'ios') {
        console.log('� Using default offering (iOS)');
      }

      if (!currentOffering) {
        console.warn('No offering available for platform:', platform);
        return;
      }

      const availableProducts: InAppProduct[] = currentOffering.availablePackages.map((pkg: PurchasesPackage) => ({
        // Prefer the store product identifier so callers can pass product IDs
        id: (pkg as any)?.product?.identifier ?? pkg.identifier,
        displayName: pkg.product.title,
        displayPrice: pkg.product.priceString,
        description: pkg.product.description,
        packageType: pkg.packageType,
      }));

      setProducts(availableProducts);
      console.log('✅ Products loaded:', availableProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los planes disponibles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, getPlatform]);

  // Save subscription to database
  const saveSubscriptionToDatabase = useCallback(
    async (subscriptionData: SubscriptionData) => {
      try {
        // Persist with minimal columns to avoid schema mismatches across environments
        const payload: any = {
          user_id: subscriptionData.user_id,
          status: subscriptionData.status,
          plan_type: subscriptionData.plan_type,
          revenuecat_customer_id: subscriptionData.revenuecat_customer_id,
          store_transaction_id: subscriptionData.store_transaction_id,
          receipt_data: subscriptionData.receipt_data,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('user_subscriptions')
          .upsert(payload, { onConflict: 'user_id' });

        if (error) {
          console.error('Error saving subscription:', error);
          throw error;
        }

        console.log('✅ Subscription saved to database');
      } catch (error) {
        console.error('Error saving subscription:', error);
        throw error;
      }
    },
    []
  );

  // Purchase product
  const purchaseProduct = useCallback(
    async (productId: string, targetOfferId?: string): Promise<PurchaseResult> => {
      // Helper: espera hasta que cualquier entitlement esté activo o expira
      // ... (same helper code)
      const waitForPremium = async (initialInfo: CustomerInfo, timeoutMs = 30000, intervalMs = 2000) => {
        let info = initialInfo;
        const start = Date.now();

        // Verificar cualquier entitlement activo (premium, pro, etc.)
        const hasActiveEntitlement = () => {
          const active = info.entitlements?.active;
          if (!active) return false;
          const activeKeys = Object.keys(active);
          console.log('🔍 Active entitlements:', activeKeys);
          return activeKeys.length > 0;
        };

        // Si ya hay entitlements activos, retornar inmediatamente
        if (hasActiveEntitlement()) {
          console.log('✅ Entitlement found immediately');
          return { info, premium: true };
        }

        while (Date.now() - start <= timeoutMs) {
          await new Promise((res) => setTimeout(res, intervalMs));
          try {
            const refreshed = await Purchases.getCustomerInfo();
            info = refreshed.customerInfo;
            console.log('🔄 Refreshed customerInfo, checking entitlements...');

            if (hasActiveEntitlement()) {
              console.log('✅ Entitlement confirmed after polling');
              return { info, premium: true };
            }
          } catch (refreshError) {
            console.warn('⚠️ Error refreshing customer info:', refreshError);
          }
        }

        console.log('⚠️ Timeout waiting for entitlement');
        return { info, premium: false };
      };

      try {
        setIsLoading(true);

        const platform = getPlatform();
        const paymentMethod = getPaymentMethod();

        if (platform === 'web') {
          return { success: false, error: 'Las compras in-app no están disponibles en web' };
        }

        // Find the package
        await ensureConfigured();

        await ensureConfigured();

        // toast({ title: "Debug", description: "📦 Buscando offerings..." });
        console.log('📦 Fetching offerings...', { platform, productId, targetOfferId });
        const offerings = await Purchases.getOfferings();
        console.log('📦 Available offerings:', {
          current: offerings.current?.identifier,
          all: Object.keys(offerings.all || {})
        });

        // En Android, usar offering 'android' si existe
        let currentOffering = offerings.current;
        if (platform === 'android' && offerings.all?.['android']) {
          currentOffering = offerings.all['android'];
          console.log('📦 Using Android-specific offering');
        }

        if (!currentOffering) {
          console.error('❌ No offerings available');
          toast({ variant: "destructive", title: "Error", description: "❌ No hay offerings disponibles en RevenueCat" });
          return { success: false, error: 'No offerings available' };
        }

        const package_ = currentOffering.availablePackages.find((pkg: PurchasesPackage) => {
          // RevenueCat en Android puede exponer identificadores con base plan (e.g., "gatofit_premium_monthly:01")
          // Mantenemos compatibilidad con iOS (SUSCRIPCION_*) y con package identifiers.
          const pkgIdentifier = (pkg as any)?.identifier ?? '';
          const productIdentifier = (pkg as any)?.product?.identifier ?? '';
          const wanted = (productId ?? '').toLowerCase();
          const a = String(pkgIdentifier).toLowerCase();
          const b = String(productIdentifier).toLowerCase();

          // match directo por package o product id
          if (a === wanted || b === wanted) return true;

          // match por prefijo cuando el product id incluye base plan
          if (wanted && (b.startsWith(`${wanted}:`) || a.startsWith(`${wanted}:`))) return true;

          // match la parte sin base plan si venimos con productId:basePlan
          const wantedNoBase = wanted.split(':')[0];
          if (wantedNoBase && (b === wantedNoBase || a === wantedNoBase)) return true;

          return false;
        });

        if (!package_) {
          const availableProducts = currentOffering.availablePackages
            .map(p => (p as any)?.product?.identifier)
            .filter(Boolean);

          console.error('❌ Product not found:', {
            wanted: productId,
            available: availableProducts
          });

          return {
            success: false,
            error: `Producto "${productId}" no encontrado. Disponibles: ${availableProducts.join(', ')}`
          };
        }

        console.log('✅ Package found:', {
          identifier: (package_ as any)?.identifier,
          productId: (package_ as any)?.product?.identifier,
          price: (package_ as any)?.product?.priceString
        });

        // toast({ description: `✅ Producto encontrado: ${productId}` });

        // Check if user already has an active subscription (for upgrade/downgrade)
        let purchaseOptions: { aPackage: PurchasesPackage; googleProductChangeInfo?: any } = {
          aPackage: package_,
        };

        if (platform === 'android') {
          try {
            const { customerInfo: currentInfo } = await Purchases.getCustomerInfo();
            const activeEntitlements = currentInfo.entitlements?.active;

            if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
              const activeEntitlement = Object.values(activeEntitlements)[0] as any;
              const currentProductId = activeEntitlement?.productIdentifier;

              if (currentProductId && currentProductId !== productId) {
                console.log('🔄 Detected plan change from', currentProductId, 'to', productId);

                // Extract base product IDs to check if they're compatible
                const currentBaseId = currentProductId.split(':')[0];
                const targetBaseId = productId.split(':')[0];

                // Only attempt upgrade/downgrade if base product IDs match
                if (currentBaseId === targetBaseId) {
                  console.log('✅ Same base product - can upgrade/downgrade');
                  purchaseOptions.googleProductChangeInfo = {
                    oldProductIdentifier: currentProductId,
                    prorationMode: 2, // IMMEDIATE_AND_CHARGE_PRORATED_PRICE
                  };
                } else {
                  console.warn(`⚠️ Different base products: ${currentBaseId} → ${targetBaseId}`);
                  console.warn('Google Play does not support changing between different product bases');
                  console.warn('User must cancel current subscription before purchasing new one');

                  toast({
                    variant: "destructive",
                    title: "Cambio de Plan No Disponible",
                    description: "Debes cancelar tu suscripción actual antes de cambiar a este plan. Ve a Google Play para cancelar."
                  });

                  return {
                    success: false,
                    error: 'Cannot change between different product bases. Please cancel current subscription first.'
                  };
                }
              }
            }
          } catch (infoError) {
            console.warn('Could not check current subscription for upgrade:', infoError);
          }
        }

        // EXECUTE PURCHASE
        let purchaseResult;

        // Special handling for Android Verification Offers (Promo Codes)
        if (platform === 'android' && targetOfferId) {
          try {
            console.log(`🎯 Attempting to purchase specific offer (Android): ${targetOfferId}`);
            const product = (package_ as any).product;

            // Look for subscription options (RC v6+ structure)
            const options = product.subscriptionOptions;
            if (options && Array.isArray(options)) {
              const targetOption = options.find((opt: any) =>
                opt.id === targetOfferId ||
                (opt.id && typeof opt.id === 'string' && opt.id.endsWith(`:${targetOfferId}`)) ||
                opt.tags?.includes(targetOfferId)
              );

              if (targetOption) {
                console.log('✅ Found matching subscription option:', targetOption.id);
                // toast({ description: `✅ Oferta aplicada: ${targetOfferId}` });

                // Purchase via specific option
                purchaseResult = await (Purchases as any).purchaseSubscriptionOption({
                  subscriptionOption: targetOption,
                  googleProductChangeInfo: purchaseOptions.googleProductChangeInfo
                });
              } else {
                console.warn(`⚠️ Offer ${targetOfferId} not found in options. Available:`, options.map((o: any) => o.id));
                // Fallback to standard package purchase
                console.log('🛒 Falling back to standard package purchase');
                purchaseResult = await Purchases.purchasePackage(purchaseOptions);
              }
            } else {
              console.warn('⚠️ No subscription options available on product');
              purchaseResult = await Purchases.purchasePackage(purchaseOptions);
            }
          } catch (offerError) {
            console.error('Error with purchaseSubscriptionOption:', offerError);
            // Fallback
            purchaseResult = await Purchases.purchasePackage(purchaseOptions);
          }
        } else if (platform === 'ios' && targetOfferId) {
          // IOS PROMOTIONAL OFFER LOGIC
          try {
            console.log(`🎯 Attempting to purchase specific offer (iOS): ${targetOfferId}`);

            const product = (package_ as any).product;
            const discounts = product.discounts;

            console.log('📦 iOS Product Details:', {
              identifier: product.identifier,
              discounts: discounts ? discounts.map((d: any) => ({
                identifier: d.identifier,
                price: d.price,
                priceString: d.priceString,
                paymentMode: d.paymentMode
              })) : 'No discounts found'
            });

            if (discounts && Array.isArray(discounts)) {

              const matchedDiscount = discounts.find((d: any) => d.identifier === targetOfferId);

              if (matchedDiscount) {
                console.log('✅ Found matching discount object:', matchedDiscount.identifier);
                // toast({ description: `✍️ Firmando oferta: ${targetOfferId}...` });

                // Sign the offer (RevenueCat handles backend signature)
                // This will fail if the Subscription Key (p8) is not uploaded to RevenueCat
                try {
                  const paymentDiscount = await Purchases.getPromotionalOffer({
                    product: product,
                    discount: matchedDiscount
                  });

                  if (paymentDiscount) {
                    console.log('✅ Offer signed successfully. Signature:', paymentDiscount);
                    console.log('🛒 Executing purchaseDiscountedPackage...');

                    purchaseResult = await Purchases.purchaseDiscountedPackage({
                      aPackage: package_,
                      discount: paymentDiscount
                    });
                  } else {
                    console.error('❌ Failed to sign promotional offer. Result was undefined.');
                    toast({
                      variant: "destructive",
                      title: "Error de Configuración",
                      description: "No se pudo firmar la oferta. Verifica la configuración en RevenueCat (iOS Subscription Key)."
                    });
                    // Do NOT fallback silently. User expects a discount.
                    return { success: false, error: 'Error al aplicar oferta promocional (Firma fallida)' };
                  }
                } catch (signError: any) {
                  console.error('❌ Error during getPromotionalOffer:', signError);

                  // Fallback on signature error or specific RC errors
                  // Error Code 18: Ineligible for offer (common for new users with Promo Offers)
                  const isIneligible = signError.code === 18 || signError.message?.includes('ineligible') || signError.userInfo?.code === 18;

                  if (isIneligible) {
                    console.warn('⚠️ User ineligible for Promotional Offer. Falling back to Standard/Intro Price.');
                    toast({
                      description: "Oferta no disponible para tu cuenta usuando precio estándar."
                    });
                    purchaseResult = await Purchases.purchasePackage(purchaseOptions);
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Error de Firma",
                      description: `Error al firmar oferta: ${signError.message || signError}`
                    });
                    return { success: false, error: `Error firmando oferta: ${signError.message}` };
                  }
                }

              } else {
                console.warn(`⚠️ Discount ${targetOfferId} NOT found on product ${product.identifier}.`);
                console.warn('Available discounts:', discounts.map((d: any) => d.identifier));

                // Fallback if discount identifier is not found
                console.log('🛒 Falling back to standard purchase logic due to missing discount ID');
                purchaseResult = await Purchases.purchasePackage(purchaseOptions);
              }
            } else {
              console.warn('⚠️ No discounts array available on iOS product details.');
              // Fallback
              purchaseResult = await Purchases.purchasePackage(purchaseOptions);
            }
          } catch (iosOfferError: any) {
            console.error('❌ Critical Error applying iOS promotional offer:', iosOfferError);

            // Check for ineligibility in the outer catch too, just in case
            const isIneligible = iosOfferError.code === 18 || iosOfferError.message?.includes('ineligible');

            if (isIneligible) {
              console.log('⚠️ User ineligible (outer catch). executing standard purchase.');
              purchaseResult = await Purchases.purchasePackage(purchaseOptions);
            } else {
              toast({ variant: "destructive", title: "Error", description: "Fallo crítico al procesar oferta." });
              return { success: false, error: 'Error crítico en oferta' };
            }
          }
        } else {
          // Standard purchase
          console.log('🛒 Initiating standard purchase for package:', package_.identifier);
          purchaseResult = await Purchases.purchasePackage(purchaseOptions);
        }

        const { customerInfo, productIdentifier } = purchaseResult;
        console.log('✅ Purchase completed, checking entitlements...');

        // ... (rest of the function handling success/verification/toasts)
        const { info: confirmedInfo, premium } = await waitForPremium(customerInfo);

        if (!premium) {
          console.log('⚠️ Payment completed but entitlement not yet reflected. Treating as success.');
        }

        console.log('✅ Purchase confirmed with premium entitlement');

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const transactionId = (confirmedInfo as any)?.latestTransactionIdentifier ?? confirmedInfo.managementURL;
          const finalProductId = productIdentifier || productId;
          const inferredPlanType = finalProductId.includes('ANUAL') || finalProductId.includes('yearly') || finalProductId.includes('influencer') ? 'yearly' : 'monthly';

          const subscriptionData: SubscriptionData = {
            user_id: user.id,
            status: 'active',
            plan_type: inferredPlanType,
            payment_method: paymentMethod,
            platform: platform,
            revenuecat_customer_id: confirmedInfo.originalAppUserId || user.id,
            store_transaction_id: transactionId ?? undefined,
            receipt_data: JSON.stringify(confirmedInfo),
          };

          void (async () => {
            // ... background save logic (kept essentially same)
            try {
              await saveSubscriptionToDatabase(subscriptionData);
            } catch (persistError) {
              console.warn('⚠️ Compra exitosa, pero falló el guardado en DB:', persistError);
            }

            // Small delay to ensure DB transaction is fully committed (or to allow retry)
            await new Promise(resolve => setTimeout(resolve, 500));

            // Dispatch event ALWAYS, even if DB save failed
            // SubscriptionContext will fetch fresh data from DB
            try {
              const inferredPlanName = inferredPlanType === 'yearly' ? 'Suscripción Anual Premium' : 'Suscripción Mensual Premium';
              console.log('🔔 Dispatching iap:purchase-success event');
              window.dispatchEvent(new CustomEvent('iap:purchase-success', {
                detail: { planType: inferredPlanType, planName: inferredPlanName, mode: 'purchase' }
              }));
            } catch { }

            try {
              if (platform === 'ios') {
                await supabase.functions.invoke('verify-appstore-receipt', {
                  body: { userId: user.id, customerInfo: confirmedInfo },
                });
              } else if (platform === 'android') {
                await supabase.functions.invoke('verify-playstore-receipt', {
                  body: { userId: user.id, packageName: 'com.gatofit.app', token: confirmedInfo.managementURL },
                });
              }
            } catch (vErr) { console.warn(vErr); }
          })();
        }

        setIsPremium(true);
        (globalThis as any).__rcLastPremiumState = true;

        toast({
          title: '¡Éxito!',
          description: 'Tu suscripción premium ha sido activada',
        });

        return { success: true, customerInfo: confirmedInfo };
      } catch (error: any) {
        console.error('Error purchasing product:', error);

        // Si el error es de cancelación, retornar silenciosamente
        if (error?.code === 'PurchaseCancelledError' ||
          error?.message?.includes('cancelled') ||
          error?.userCancelled) {
          return { success: false, error: 'Compra cancelada' };
        }

        if (error?.code === 'ProductNotAvailableForPurchaseError') {
          return { success: false, error: 'Producto no disponible' };
        }

        if (error?.code === 'PurchaseInvalidError') {
          return { success: false, error: 'Recibo inválido' };
        }

        // ITEM_ALREADY_OWNED: El usuario ya tiene esta suscripción activa
        if (error?.code === 'ProductAlreadyPurchasedError' ||
          error?.message?.includes('ITEM_ALREADY_OWNED') ||
          error?.message?.includes('already active')) {
          console.log('⚠️ ITEM_ALREADY_OWNED - checking current subscription status...');

          try {
            const { customerInfo } = await Purchases.getCustomerInfo();
            const hasActiveEntitlement = Object.keys(customerInfo.entitlements?.active || {}).length > 0;

            if (hasActiveEntitlement) {
              console.log('✅ User already has active subscription');
              setIsPremium(true);
              (globalThis as any).__rcLastPremiumState = true;

              toast({
                title: 'Ya tienes suscripción activa',
                description: 'Tu suscripción premium sigue activa.',
              });

              return { success: true, customerInfo };
            }
          } catch (checkError) {
            console.warn('Could not verify subscription status:', checkError);
          }

          toast({
            title: 'Suscripción existente',
            description: 'Ya tienes una suscripción activa.',
            variant: 'destructive',
          });

          return { success: false, error: 'Ya tienes una suscripción activa' };
        }

        // Para errores post-pago (el usuario ya pagó pero algo falló después)
        try {
          console.log('🔄 Checking if purchase was actually successful despite error...');
          const { customerInfo } = await Purchases.getCustomerInfo();
          const hasActiveEntitlement = Object.keys(customerInfo.entitlements?.active || {}).length > 0;

          if (hasActiveEntitlement) {
            console.log('✅ User has active entitlement despite error - treating as success');
            setIsPremium(true);
            (globalThis as any).__rcLastPremiumState = true;

            toast({
              title: '¡Éxito!',
              description: 'Tu suscripción premium ha sido activada',
            });

            return { success: true, customerInfo };
          }
        } catch (checkError) {
          console.warn('Could not verify post-error status:', checkError);
        }

        const errorMessage = error?.message || 'Error al procesar la compra';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [toast, getPlatform, getPaymentMethod, saveSubscriptionToDatabase]
  );

  // Check if user is premium
  const checkPremiumStatus = useCallback(async () => {
    try {
      const platform = getPlatform();

      if (platform === 'web') {
        return false;
      }

      await ensureConfigured();
      const response = await Purchases.getCustomerInfo();
      const customerInfo = response.customerInfo;

      const hasPremium = !!customerInfo.entitlements.active.premium;
      setIsPremium(hasPremium);
      (globalThis as any).__rcLastPremiumState = hasPremium;

      if (hasPremium) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Infer plan type from active subscrptions
          const activeIds = (customerInfo as any)?.activeSubscriptions as string[] | undefined;
          const planIsYearly = activeIds?.some(id => id?.includes('ANUAL') || id?.toLowerCase()?.includes('year') || id?.includes('influencer')) ?? false;
          const inferredPlanType = planIsYearly ? 'yearly' : 'monthly';

          await saveSubscriptionToDatabase({
            user_id: user.id,
            status: 'active',
            plan_type: inferredPlanType,
            payment_method: getPaymentMethod(),
            platform: platform,
            revenuecat_customer_id: customerInfo.originalAppUserId || user.id,
          });
        }
      } else {
        // Fallback: If user is NOT premium but WAS premium or has purchase history, ensure DB reflects expired.
        // This handles cases where Webhook might have failed or delayed.
        const { data: { user } } = await supabase.auth.getUser();

        // Check if user has ANY purchase history
        const hasHistory = customerInfo.allPurchasedProductIdentifiers && customerInfo.allPurchasedProductIdentifiers.length > 0;

        if (user && hasHistory) {
          console.log('⚠️ User has purchase history but no active entitlement. Ensuring DB sync as EXPIRED.');

          // Try to infer last plan type from history
          // Simple inference: use the last item in the array or default to monthly
          const lastId = customerInfo.allPurchasedProductIdentifiers[0] || '';
          const lastPlanType = (lastId.toLowerCase().includes('year') || lastId.includes('ANUAL') || lastId.includes('influencer')) ? 'yearly' : 'monthly';

          // Only update if we haven't checked recently or state changed
          // (For implementation simplicity, we just upsert. Supabase handles it efficiently)
          await saveSubscriptionToDatabase({
            user_id: user.id,
            status: 'expired',
            plan_type: lastPlanType,
            payment_method: getPaymentMethod(), // Might not be accurate if they switched, but sufficient for status sync
            platform: platform,
            revenuecat_customer_id: customerInfo.originalAppUserId || user.id,
          });
        }
      }

      return hasPremium;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }, [getPlatform, getPaymentMethod, saveSubscriptionToDatabase]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    try {
      setIsLoading(true);

      const platform = getPlatform();

      if (platform === 'web') {
        toast({
          title: 'ℹ️ No disponible en web',
          description: 'Solo disponible en app nativa',
        });
        return null;
      }

      await ensureConfigured();
      const response = await Purchases.restorePurchases();
      const customerInfo = response.customerInfo;

      const hasPremium = !!customerInfo.entitlements.active.premium;
      setIsPremium(hasPremium);
      (globalThis as any).__rcLastPremiumState = hasPremium;

      if (hasPremium) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await saveSubscriptionToDatabase({
            user_id: user.id,
            status: 'active',
            plan_type: 'monthly',
            payment_method: getPaymentMethod(),
            platform: platform,
            revenuecat_customer_id: customerInfo.originalAppUserId || user.id,
            receipt_data: JSON.stringify(customerInfo),
          });
        }

        toast({
          title: '✅ Compras restauradas',
          description: 'Tu suscripción premium ha sido restaurada',
        });

        try {
          const activeIds = (customerInfo as any)?.activeSubscriptions as string[] | undefined;
          const planIsYearly = activeIds?.some(id => id?.includes('ANUAL') || id?.toLowerCase()?.includes('year')) ?? false;
          const planType = planIsYearly ? 'yearly' : 'monthly';
          const planName = planIsYearly ? 'Suscripción Anual Premium' : 'Suscripción Mensual Premium';
          window.dispatchEvent(new CustomEvent('iap:subscription-restored', { detail: { planType, planName, mode: 'restore' } }));
        } catch (e) {
          // noop
        }
      } else {
        toast({
          title: 'ℹ️ Sin compras',
          description: 'No se encontraron suscripciones premium',
        });
      }

      return customerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron restaurar las compras',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, getPlatform, getPaymentMethod, saveSubscriptionToDatabase]);

  return {
    initializeRevenueCat,
    loadProducts,
    purchaseProduct,
    checkPremiumStatus,
    restorePurchases,
    products,
    isLoading,
    isPremium,
  };
};
