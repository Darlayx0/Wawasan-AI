
import { useState, useEffect } from 'react';

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLandscape: false,
    deviceType: 'desktop'
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      
      // Tailwind breakpoints logic
      const isMobile = width < 768; // sm + md range start
      const isTablet = width >= 768 && width < 1024; // md to lg
      const isDesktop = width >= 1024; // lg and up

      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile) deviceType = 'mobile';
      else if (isTablet) deviceType = 'tablet';

      setState({
        isMobile,
        isTablet,
        isDesktop,
        isLandscape,
        deviceType
      });
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
};
