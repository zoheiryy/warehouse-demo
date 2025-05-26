import * as React from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { CaretDownIcon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import './NavigationBar.css';

const NavigationBar = () => {
  return (
    <header className="navigation-header">
      <div className="navigation-container">
        {/* Logo */}
        <div className="navigation-logo">
          <a href="/" className="logo-link">
            <div className="logo-text">متجرنا</div>
          </a>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu.Root className="NavigationMenuRoot" dir="rtl">
          <NavigationMenu.List className="NavigationMenuList">
            
            {/* Products Menu */}
            <NavigationMenu.Item>
              <NavigationMenu.Trigger className="NavigationMenuTrigger">
                المنتجات <CaretDownIcon className="CaretDown" aria-hidden />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="NavigationMenuContent">
                <ul className="NavigationMenuGrid">
                  <li className="NavigationMenuGridItem">
                    <NavigationMenu.Link asChild>
                      <a className="NavigationMenuCallout" href="/products/electronics">
                        <div className="CalloutHeading">الإلكترونيات</div>
                        <p className="CalloutText">أحدث الأجهزة الإلكترونية والتقنية</p>
                      </a>
                    </NavigationMenu.Link>
                  </li>
                  <NavigationMenuItem 
                    href="/products/clothing" 
                    title="الملابس"
                  >
                    مجموعة واسعة من الملابس العصرية
                  </NavigationMenuItem>
                  <NavigationMenuItem 
                    href="/products/home" 
                    title="المنزل والمطبخ"
                  >
                    كل ما تحتاجه لمنزلك
                  </NavigationMenuItem>
                  <NavigationMenuItem 
                    href="/products/books" 
                    title="الكتب"
                  >
                    مكتبة شاملة للكتب العربية والمترجمة
                  </NavigationMenuItem>
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            {/* Services Menu */}
            <NavigationMenu.Item>
              <NavigationMenu.Trigger className="NavigationMenuTrigger">
                الخدمات <CaretDownIcon className="CaretDown" aria-hidden />
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="NavigationMenuContent">
                <ul className="NavigationMenuList">
                  <NavigationMenuItem 
                    title="الشحن والتوصيل" 
                    href="/services/shipping"
                  >
                    خدمة توصيل سريعة وآمنة
                  </NavigationMenuItem>
                  <NavigationMenuItem 
                    title="خدمة العملاء" 
                    href="/services/support"
                  >
                    دعم فني على مدار الساعة
                  </NavigationMenuItem>
                  <NavigationMenuItem 
                    title="الإرجاع والاستبدال" 
                    href="/services/returns"
                  >
                    سياسة مرنة للإرجاع والاستبدال
                  </NavigationMenuItem>
                  <NavigationMenuItem 
                    title="برنامج الولاء" 
                    href="/services/loyalty"
                  >
                    اكسب نقاط مع كل عملية شراء
                  </NavigationMenuItem>
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            {/* About Link */}
            <NavigationMenu.Item>
              <NavigationMenu.Link className="NavigationMenuLink" href="/about">
                من نحن
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            {/* Contact Link */}
            <NavigationMenu.Item>
              <NavigationMenu.Link className="NavigationMenuLink" href="/contact">
                اتصل بنا
              </NavigationMenu.Link>
            </NavigationMenu.Item>

            <NavigationMenu.Indicator className="NavigationMenuIndicator">
              <div className="Arrow" />
            </NavigationMenu.Indicator>
          </NavigationMenu.List>

          <div className="ViewportPosition">
            <NavigationMenu.Viewport className="NavigationMenuViewport" />
          </div>
        </NavigationMenu.Root>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-container">
          <button className="mobile-menu-button" aria-label="فتح القائمة">
            <HamburgerMenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

const NavigationMenuItem = React.forwardRef(({ className, children, title, href, ...props }, forwardedRef) => (
  <li>
    <NavigationMenu.Link asChild>
      <a 
        className={`NavigationMenuItemLink ${className || ''}`} 
        href={href}
        {...props} 
        ref={forwardedRef}
      >
        <div className="NavigationMenuItemHeading">{title}</div>
        <p className="NavigationMenuItemText">{children}</p>
      </a>
    </NavigationMenu.Link>
  </li>
));

NavigationMenuItem.displayName = 'NavigationMenuItem';

export default NavigationBar;