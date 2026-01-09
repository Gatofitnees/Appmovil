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

            // If transitioned from not-premium to premium (restore/renew), emit event
            if (wasPremium === false && nowPremium === true) {
              const activeIds = (customerInfo as any)?.activeSubscriptions as string[] | undefined;
              const planIsYearly = activeIds?.some(id => id?.includes('ANUAL') || id?.toLowerCase()?.includes('year')) ?? false;
              const planType = planIsYearly ? 'yearly' : 'monthly';
              const planName = planIsYearly ? 'Suscripción Anual Premium' : 'Suscripción Mensual Premium';
              window.dispatchEvent(new CustomEvent('iap:subscription-restored', { detail: { planType, planName, mode: 'restore' } }));
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
          .upsert(payload);

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
    async (productId: string): Promise<PurchaseResult> => {
      // Helper: espera hasta que cualquier entitlement esté activo o expira
      // Android puede tardar más en propagar entitlements que iOS
      const waitForPremium = async (initialInfo: CustomerInfo, timeoutMs = 12000, intervalMs = 1000) => {
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
        const offerings = await Purchases.getOfferings();
        
        // En Android, usar offering 'android' si existe
        let currentOffering = offerings.current;
        if (platform === 'android' && offerings.all?.['android']) {
          currentOffering = offerings.all['android'];
        }
        
        if (!currentOffering) {
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

          // match por prefijo cuando el product id incluye base plan (e.g., wanted "gatofit_premium_monthly" y b "gatofit_premium_monthly:01")
          if (wanted && (b.startsWith(`${wanted}:`) || a.startsWith(`${wanted}:`))) return true;

          // match la parte sin base plan si venimos con productId:basePlan
          const wantedNoBase = wanted.split(':')[0];
          if (wantedNoBase && (b === wantedNoBase || a === wantedNoBase)) return true;

          return false;
        });

        if (!package_) {
          return { success: false, error: 'Producto no encontrado' };
        }

        // Check if user already has an active subscription (for upgrade/downgrade)
        // This is critical to avoid duplicate subscriptions on Google Play
        let purchaseOptions: { aPackage: PurchasesPackage; googleProductChangeInfo?: any } = {
          aPackage: package_,
        };

        if (platform === 'android') {
          try {
            const { customerInfo: currentInfo } = await Purchases.getCustomerInfo();
            const activeEntitlements = currentInfo.entitlements?.active;
            
            if (activeEntitlements && Object.keys(activeEntitlements).length > 0) {
              // User has active subscription - this is an upgrade/downgrade
              // Find the current product ID from active entitlements
              const activeEntitlement = Object.values(activeEntitlements)[0] as any;
              const currentProductId = activeEntitlement?.productIdentifier;
              
              if (currentProductId && currentProductId !== productId) {
                console.log('🔄 Detected plan change from', currentProductId, 'to', productId);
                
                // Use IMMEDIATE_AND_CHARGE_PRORATED_PRICE for upgrades
                // This replaces the old subscription immediately
                purchaseOptions.googleProductChangeInfo = {
                  oldProductIdentifier: currentProductId,
                  prorationMode: 2, // IMMEDIATE_AND_CHARGE_PRORATED_PRICE
                };
                
                console.log('📦 Using googleProductChangeInfo:', purchaseOptions.googleProductChangeInfo);
              }
            }
          } catch (infoError) {
            console.warn('Could not check current subscription for upgrade:', infoError);
            // Continue with normal purchase
          }
        }

        // Make purchase (with upgrade info if applicable)
        console.log('🛒 Initiating purchase for package:', package_.identifier);
        const { customerInfo } = await Purchases.purchasePackage(purchaseOptions);

        console.log('✅ Purchase completed, checking entitlements...');

        // Esperar confirmación de premium (entitlement activo)
        const { info: confirmedInfo, premium } = await waitForPremium(customerInfo);

        // Si el pago se completó pero el entitlement aún no se refleja,
        // tratarlo como éxito de todos modos (RevenueCat lo procesará)
        if (!premium) {
          console.log('⚠️ Payment completed but entitlement not yet reflected. Treating as success.');
          // No mostrar error - el pago fue exitoso, solo hay delay en propagación
        }

        console.log('✅ Purchase confirmed with premium entitlement');

        // Emitir popup inmediatamente tras confirmar premium (no bloquear por DB/verify)
        try {
          const inferredPlanType = productId.includes('ANUAL') || productId.includes('yearly') ? 'yearly' : 'monthly';
          const inferredPlanName = inferredPlanType === 'yearly' ? 'Suscripción Anual Premium' : 'Suscripción Mensual Premium';
          window.dispatchEvent(new CustomEvent('iap:purchase-success', {
            detail: { planType: inferredPlanType, planName: inferredPlanName, mode: 'purchase' }
          }));
        } catch {}

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const transactionId = (confirmedInfo as any)?.latestTransactionIdentifier ?? confirmedInfo.managementURL;

          const subscriptionData: SubscriptionData = {
            user_id: user.id,
            status: 'active',
            plan_type: productId.includes('ANUAL') || productId.includes('yearly') ? 'yearly' : 'monthly',
            payment_method: paymentMethod,
            platform: platform,
            revenuecat_customer_id: confirmedInfo.originalAppUserId || user.id,
            store_transaction_id: transactionId ?? undefined,
            receipt_data: JSON.stringify(confirmedInfo),
          };

          // Persistir y verificar en segundo plano (no bloquear UI/popup)
          void (async () => {
            try {
              await saveSubscriptionToDatabase(subscriptionData);
            } catch (persistError) {
              console.warn('⚠️ Compra exitosa, pero falló el guardado en DB:', persistError);
            }
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
            } catch (verificationError) {
              console.warn('Receipt verification skipped:', verificationError);
            }
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
            error?.message?.includes('canceled')) {
          return { success: false, error: 'Compra cancelada' };
        } 
        
        if (error?.code === 'ProductNotAvailableForPurchaseError') {
          return { success: false, error: 'Producto no disponible' };
        } 
        
        if (error?.code === 'PurchaseInvalidError') {
          return { success: false, error: 'Recibo inválido' };
        }

        // ITEM_ALREADY_OWNED: El usuario ya tiene esta suscripción activa
        // Esto puede pasar si:
        // 1. Intentó comprar el mismo producto que ya tiene
        // 2. Hay un problema con upgrades entre diferentes suscripciones
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
                description: 'Tu suscripción premium sigue activa. Para cambiar de plan, cancela primero la actual desde Google Play.',
              });
              
              return { success: true, customerInfo };
            }
          } catch (checkError) {
            console.warn('Could not verify subscription status:', checkError);
          }
          
          toast({
            title: 'Suscripción existente',
            description: 'Ya tienes una suscripción activa. Administra tus suscripciones desde Google Play Store.',
            variant: 'destructive',
          });
          
          return { success: false, error: 'Ya tienes una suscripción activa' };
        }

        // Para errores post-pago (el usuario ya pagó pero algo falló después),
        // intentar verificar si el usuario ahora tiene una suscripción activa
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
          await saveSubscriptionToDatabase({
            user_id: user.id,
            status: 'active',
            plan_type: 'monthly',
            payment_method: getPaymentMethod(),
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
