# RTL Implementation Guide for Warehouse Management System

## Overview
This guide provides comprehensive instructions for implementing Right-to-Left (RTL) components in the Warehouse Management System. Follow these guidelines to ensure consistent, accessible, and properly functioning RTL interfaces.

## Core Principles

### 1. **Always Use CSS Logical Properties**
Replace physical properties with logical equivalents to ensure automatic RTL adaptation:

```css
/* ❌ AVOID - Physical Properties */
margin-left: 16px;
margin-right: 8px;
padding-left: 12px;
border-right: 1px solid #ccc;
left: 0;
right: auto;

/* ✅ USE - Logical Properties */
margin-inline-start: 16px;
margin-inline-end: 8px;
padding-inline-start: 12px;
border-inline-end: 1px solid #ccc;
inset-inline-start: 0;
inset-inline-end: auto;
```

### 2. **Logical Property Reference**
| Physical Property | Logical Equivalent | RTL Behavior |
|------------------|-------------------|--------------|
| `margin-left` | `margin-inline-start` | Right margin in RTL |
| `margin-right` | `margin-inline-end` | Left margin in RTL |
| `padding-left` | `padding-inline-start` | Right padding in RTL |
| `padding-right` | `padding-inline-end` | Left padding in RTL |
| `border-left` | `border-inline-start` | Right border in RTL |
| `border-right` | `border-inline-end` | Left border in RTL |
| `left` | `inset-inline-start` | Right position in RTL |
| `right` | `inset-inline-end` | Left position in RTL |
| `text-align: left` | `text-align: start` | Right-aligned in RTL |
| `text-align: right` | `text-align: end` | Left-aligned in RTL |

## Component Structure Guidelines

### 1. **Container Setup**
```jsx
const MyComponent = () => {
  return (
    <div style={{
      direction: 'rtl', // Explicit RTL direction
      fontFamily: 'Tajawal, sans-serif', // Arabic-optimized font
      // Use logical properties for all spacing and positioning
    }}>
      {/* Component content */}
    </div>
  );
};
```

### 2. **Positioning Components**
```jsx
// Sidebar positioning (start side)
style={{
  position: 'fixed',
  insetInlineStart: 0, // Left in LTR, Right in RTL
  borderInlineEnd: '1px solid #e5e7eb', // Border on content side
  boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)' // Shadow toward content
}}

// Content area adjustment
style={{
  marginInlineStart: '64px', // Space for sidebar
  transition: 'margin-inline-start 0.3s ease-in-out'
}}
```

### 3. **Flexbox and Grid Layouts**
```jsx
// Flexbox with RTL support
style={{
  display: 'flex',
  justifyContent: 'flex-start', // Natural start alignment
  alignItems: 'center',
  gap: '12px', // Use gap instead of margins when possible
  textAlign: 'start' // RTL-aware text alignment
}}

// Grid with logical properties
style={{
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gap: '8px',
  paddingInline: '16px' // Horizontal padding
}}
```

## Typography and Content

### 1. **Font Configuration**
```jsx
// Primary Arabic font with fallbacks
fontFamily: 'Tajawal, sans-serif'

// Font weights for Arabic text
fontWeight: '400' // Regular
fontWeight: '500' // Medium
fontWeight: '600' // Semi-bold
fontWeight: '700' // Bold
```

### 2. **Text Direction and Alignment**
```jsx
style={{
  direction: 'rtl',
  textAlign: 'start', // Not 'right' - use logical alignment
  unicodeBidi: 'embed' // For mixed content
}}
```

### 3. **Bilingual Content Handling**
```jsx
// Arabic primary, English secondary
<span style={{ fontFamily: 'Tajawal, sans-serif' }}>
  {arabicText}
</span>
{englishText && (
  <span style={{ 
    fontFamily: 'Outfit, sans-serif',
    fontSize: '0.9em',
    opacity: 0.7,
    marginInlineStart: '8px'
  }}>
    ({englishText})
  </span>
)}
```

## Interactive Elements

### 1. **Button Layout**
```jsx
<button style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingInline: '16px',
  paddingBlock: '8px',
  textAlign: 'start',
  justifyContent: 'flex-start'
}}>
  <Icon size={20} />
  <span style={{ flex: 1 }}>Button Text</span>
  {badge && (
    <span style={{ marginInlineStart: '8px' }}>
      {badge}
    </span>
  )}
</button>
```

### 2. **Form Elements**
```jsx
// Input fields
<input style={{
  textAlign: 'start',
  paddingInlineStart: '12px',
  paddingInlineEnd: '8px',
  borderRadius: '4px'
}} />

// Labels
<label style={{
  display: 'block',
  marginInlineEnd: '8px',
  textAlign: 'start'
}}>
  Label Text
</label>
```

### 3. **Navigation Elements**
```jsx
// Navigation items
<nav>
  <ul style={{ 
    listStyle: 'none',
    paddingInlineStart: 0,
    marginBlock: 0
  }}>
    <li style={{ marginInlineEnd: '16px' }}>
      <a href="#" style={{ textAlign: 'start' }}>
        Navigation Item
      </a>
    </li>
  </ul>
</nav>
```

## Visual Design

### 1. **Color Contrast Requirements**
```jsx
// Ensure proper contrast for Arabic text
const colors = {
  primary: '#374151',      // Dark gray for main text
  secondary: '#6b7280',    // Medium gray for secondary text
  disabled: '#9ca3af',     // Light gray for disabled states
  active: '#0369a1',       // Blue for active states
  background: '#ffffff',   // White background
  border: '#e5e7eb'        // Light gray borders
};
```

### 2. **Icon Positioning**
```jsx
// Icons in RTL context
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <Icon 
    size={20} 
    style={{ 
      flexShrink: 0,
      color: isActive ? '#0369a1' : '#374151'
    }} 
  />
  <span style={{ flex: 1 }}>Text content</span>
</div>
```

### 3. **Shadows and Borders**
```jsx
// Shadows should cast toward content
boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)' // For start-side elements
boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)' // For end-side elements

// Borders on appropriate sides
borderInlineEnd: '1px solid #e5e7eb' // Border toward content
borderInlineStart: '1px solid #e5e7eb' // Border away from content
```

## Animation and Transitions

### 1. **Slide Animations**
```jsx
// Text slide-in animation for RTL
transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)'

// Element slide animations
transform: isVisible ? 'translateX(0)' : 'translateX(20px)'
```

### 2. **Hover Effects**
```jsx
// Hover state management
const [isHovered, setIsHovered] = useState(false);

<element
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  style={{
    background: isHovered ? '#f9fafb' : 'transparent',
    transition: 'all 0.2s ease-in-out'
  }}
/>
```

## Common Patterns

### 1. **Sidebar Component Pattern**
```jsx
const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <aside style={{
      position: 'fixed',
      insetInlineStart: 0,
      width: isExpanded ? '280px' : '64px',
      borderInlineEnd: '1px solid #e5e7eb',
      transition: 'width 0.3s ease-in-out',
      direction: 'rtl'
    }}>
      {/* Sidebar content */}
    </aside>
  );
};
```

### 2. **Card Component Pattern**
```jsx
const Card = ({ children, ...props }) => (
  <div style={{
    background: '#ffffff',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    direction: 'rtl'
  }} {...props}>
    {children}
  </div>
);
```

### 3. **Status Badge Pattern**
```jsx
const StatusBadge = ({ status, children }) => (
  <span style={{
    fontSize: '10px',
    fontWeight: '500',
    padding: '2px 6px',
    borderRadius: '4px',
    background: status === 'active' ? '#dcfce7' : '#f3f4f6',
    color: status === 'active' ? '#166534' : '#6b7280',
    marginInlineStart: '8px'
  }}>
    {children}
  </span>
);
```

## Testing Guidelines

### 1. **Visual Testing Checklist**
- [ ] Text flows naturally from right to left
- [ ] Icons are positioned correctly relative to text
- [ ] Margins and padding create proper spacing
- [ ] Borders appear on the correct sides
- [ ] Shadows cast in the appropriate direction
- [ ] Hover states work smoothly
- [ ] Animations move in the correct direction

### 2. **Functional Testing**
- [ ] Navigation works as expected
- [ ] Form inputs accept Arabic text properly
- [ ] Keyboard navigation follows RTL flow
- [ ] Screen readers announce content correctly
- [ ] Mobile responsive behavior is maintained

### 3. **Cross-Browser Testing**
- [ ] Chrome/Chromium browsers
- [ ] Firefox
- [ ] Safari (if applicable)
- [ ] Mobile browsers

## Common Pitfalls to Avoid

### 1. **❌ Don't Use Physical Properties**
```jsx
// Wrong
style={{ marginLeft: '16px', textAlign: 'right' }}

// Correct
style={{ marginInlineStart: '16px', textAlign: 'start' }}
```

### 2. **❌ Don't Hardcode Directions**
```jsx
// Wrong
transform: 'translateX(20px)'

// Correct - consider RTL context
transform: isExpanded ? 'translateX(0)' : 'translateX(-20px)'
```

### 3. **❌ Don't Forget Font Specifications**
```jsx
// Wrong - generic fonts
fontFamily: 'Arial, sans-serif'

// Correct - Arabic-optimized fonts
fontFamily: 'Tajawal, sans-serif'
```

### 4. **❌ Don't Use Absolute Positioning Without Logical Properties**
```jsx
// Wrong
style={{ position: 'absolute', right: '16px' }}

// Correct
style={{ position: 'absolute', insetInlineEnd: '16px' }}
```

## Integration with Tagaddod Design System

### 1. **Theme Provider Setup**
```jsx
import { ThemeProvider } from '@tagaddod-design/react';

<ThemeProvider theme="tagaddod" direction="rtl">
  <App />
</ThemeProvider>
```

### 2. **Using Design System Components**
```jsx
// When using Tagaddod components, they should automatically support RTL
import { Button, Card, Input } from '@tagaddod-design/react';

// Ensure proper direction context
<div style={{ direction: 'rtl' }}>
  <Button>Arabic Button Text</Button>
</div>
```

## Project-Specific Considerations

### 1. **Warehouse Management Context**
- Navigation should prioritize frequently used operations
- Status indicators should be clearly visible and accessible
- Data tables should maintain readability in RTL layout
- Form workflows should follow natural RTL progression

### 2. **Arabic Business Terminology**
- Use consistent Arabic terminology throughout
- Provide English translations in parentheses when helpful
- Maintain proper Arabic grammar and spelling
- Consider regional variations in terminology

### 3. **Performance Considerations**
- Minimize layout shifts during RTL rendering
- Optimize font loading for Arabic typefaces
- Test with realistic Arabic content lengths
- Ensure smooth animations and transitions

## Quick Reference Checklist

When creating a new component, ensure:

- [ ] `direction: 'rtl'` is set on the container
- [ ] All spacing uses logical properties (`margin-inline-*`, `padding-inline-*`)
- [ ] Positioning uses logical properties (`inset-inline-*`)
- [ ] Text alignment uses `start`/`end` instead of `left`/`right`
- [ ] Font family includes `Tajawal, sans-serif` for Arabic text
- [ ] Colors meet contrast requirements
- [ ] Icons are positioned using flexbox with `gap`
- [ ] Animations consider RTL direction
- [ ] Borders and shadows are on the correct sides
- [ ] Component is tested with Arabic content

## Resources

- [CSS Logical Properties MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [RTL Styling Best Practices](https://rtlstyling.com/)
- [Arabic Typography Guidelines](https://fonts.google.com/knowledge/choosing_type/introducing_arabic_typography)
- [Tagaddod Design System Documentation](https://tagaddod-design.com/)

---

**Remember**: RTL is not just about flipping the layout—it's about creating a natural, intuitive experience for Arabic-speaking users. Always test with real Arabic content and consider the cultural context of your users. 