import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useBranding } from "@/contexts/BrandingContext";
import { motion } from "framer-motion";

// --- Custom Icons (Memoized for performance) ---

const IconHome = React.memo(({ className }: { className?: string }) => (
  <svg
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className={cn(className, "will-change-transform")}
    fill="currentColor"
  >
    <path d="M256,319.841c-35.346,0-64,28.654-64,64v128h128v-128C320,348.495,291.346,319.841,256,319.841z" />
    <g>
      <path d="M362.667,383.841v128H448c35.346,0,64-28.654,64-64V253.26c0.005-11.083-4.302-21.733-12.011-29.696l-181.29-195.99    c-31.988-34.61-85.976-36.735-120.586-4.747c-1.644,1.52-3.228,3.103-4.747,4.747L12.395,223.5    C4.453,231.496-0.003,242.31,0,253.58v194.261c0,35.346,28.654,64,64,64h85.333v-128c0.399-58.172,47.366-105.676,104.073-107.044    C312.01,275.383,362.22,323.696,362.667,383.841z" />
      <path d="M256,319.841c-35.346,0-64,28.654-64,64v128h128v-128C320,348.495,291.346,319.841,256,319.841z" />
    </g>
  </svg>
));
IconHome.displayName = "IconHome";

const IconWorkout = React.memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={cn(className, "will-change-transform")}
    fill="currentColor"
  >
    <path d="M22.144,6.423c-.382-.455-.774-.901-1.174-1.336l.245-.247c.583-.589,.58-1.538-.009-2.122-.588-.583-1.538-.578-2.121,.009l-.228,.23c-.431-.402-.87-.794-1.314-1.173-1.3-1.109-3.188-1.033-4.388,.178l-2.603,2.624c-.343,.346-.387,.887-.104,1.283,.047,.065,.977,1.365,2.511,3.035l-4.029,4.063c-1.661-1.55-2.936-2.475-3-2.521-.399-.288-.947-.242-1.294,.106l-2.603,2.623c-1.195,1.206-1.27,3.099-.175,4.402,.382,.455,.774,.901,1.174,1.336l-.245,.247c-.583,.589-.58,1.538,.009,2.122,.292,.29,.674,.435,1.056,.435,.386,0,.772-.148,1.065-.443l.228-.23c.431,.402,.87,.794,1.314,1.173,.615,.524,1.361,.784,2.103,.784,.828,0,1.652-.323,2.286-.961l2.603-2.624c-.343-.346-.387-.887-.104-1.283-.047-.065-.977-1.365-2.511-3.035l4.029-4.063c1.661,1.55,2.936,2.475,3,2.521,.176,.127,.381,.189,.584,.189,.259,0,.516-.101,.71-.296l2.603-2.623h0c1.195-1.206,1.27-3.099,.175-4.402Z" />
  </svg>
));
IconWorkout.displayName = "IconWorkout";

const IconNutrition = React.memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={cn(className, "will-change-transform")}
    fill="currentColor"
  >
    <path d="M20.246,6.769s-.008-.008-.011-.011c-.188,.281-.404,.543-.646,.782-1.009,1.057-2.442,1.623-4.131,1.623-1.068,0-2.052-.228-2.689-.418l-1.108-.333-.293-1.041c-.007-1.899-.57-3.737-1.63-5.317-.462-.688-1.393-.874-2.081-.411-.688,.461-.872,1.393-.411,2.081,.255,.381,.469,.784,.638,1.202-1.505-.023-2.989,.653-4.132,1.844-1.362,1.42-5.356,6.614,.436,13.837,1.688,2.105,3.805,2.394,5.69,2.394,.371,0,.734-.011,1.082-.022,.697-.022,1.38-.022,2.078,0,2.114,.065,4.751,.147,6.772-2.372,5.792-7.222,1.798-12.416,.436-13.837Z" />
    <path d="M17.943,6.206c1.657-1.539,1.149-3.85,.846-4.909-1.042-.299-3.306-.718-4.689,.711-1.435,1.4-1.02,3.678-.727,4.719,1.045,.313,3.139,.807,4.569-.521Z" />
  </svg>
));
IconNutrition.displayName = "IconNutrition";

const IconRanking = React.memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={cn(className, "will-change-transform")}
    fill="currentColor"
  >
    <path d="M12,24c-5.514,0-10-4.486-10-10h0c0-3.358,1.505-5.459,3.765-7.58l2.448-2.299-.792,3.263c-.275,1.136-.347,4.606,1.112,6.461,.611,.777,1.418,1.155,2.467,1.155,1.107,0,1.986-.884,2-2.013,.014-1.117-.458-2.042-.958-3.02-.512-1.002-1.042-2.037-1.042-3.295,0-2.711,1.412-5.168,1.472-5.271L13.3-.021l.881,1.391c.849,1.339,1.994,2.587,3.103,3.794,2.319,2.524,4.717,5.136,4.717,8.837,0,5.514-4.486,10-10,10Z" />
  </svg>
));
IconRanking.displayName = "IconRanking";

const IconSocial = React.memo(({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={cn(className, "will-change-transform")}
    fill="currentColor"
  >
    <path d="m7.5 13a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm6.5 11h-13a1 1 0 0 1 -1-1v-.5a7.5 7.5 0 0 1 15 0v.5a1 1 0 0 1 -1 1zm3.5-15a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm-1.421 2.021a6.825 6.825 0 0 0 -4.67 2.831 9.537 9.537 0 0 1 4.914 5.148h6.677a1 1 0 0 0 1-1v-.038a7.008 7.008 0 0 0 -7.921-6.941z" />
  </svg>
));
IconSocial.displayName = "IconSocial";


interface NavItem {
  id: string;
  icon: React.FC<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { id: "home", icon: IconHome, path: "/home" },
  { id: "workout", icon: IconWorkout, path: "/workout" },
  { id: "nutrition", icon: IconNutrition, path: "/nutrition" },
  { id: "ranking", icon: IconRanking, path: "/ranking" },
  { id: "social", icon: IconSocial, path: "/social" }
];

const NavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { branding } = useBranding();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ paddingBottom: 'calc(var(--safe-area-inset-bottom) + 0.5rem)' }}>
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="mx-auto max-w-sm w-[90%] pointer-events-auto bg-black/40 backdrop-blur-lg border border-white/10 shadow-2xl rounded-[2.5rem] flex items-center justify-between px-2 py-2 will-change-transform"
      >
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isActive) return;
                navigate(item.path, { replace: true });
              }}
              className="relative flex items-center justify-center w-14 h-14 rounded-full transition-colors duration-200 z-10"
              style={isActive ? { color: '#2094F3' } : {}}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "bg-white/10"
                  )}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                />
              )}

              <div className="relative z-10 flex items-center justify-center">
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive
                      ? "text-[#2094F3] scale-110"
                      : "text-gray-400 opacity-70"
                  )}
                />
              </div>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default NavBar;
