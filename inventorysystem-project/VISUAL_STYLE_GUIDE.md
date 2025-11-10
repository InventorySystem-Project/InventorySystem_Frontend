# 🎨 Visual Style Guide - Enhanced Tables

## Color Palette

### Primary Colors
- **Primary Blue**: `#3b82f6` (rgb(59, 130, 246))
- **Secondary Purple**: `#a855f7` (rgb(168, 85, 247))
- **Success Green**: `#10b981` (rgb(16, 185, 129))
- **Error Red**: `#ef4444` (rgb(239, 68, 68))
- **Warning Orange**: `#f59e0b` (rgb(245, 158, 11))
- **Info Cyan**: `#06b6d4` (rgb(6, 182, 212))

### Background Colors
- **Table Container**: `#ffffff` with shadow
- **Table Header Gradient**: `linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))`
- **Row Hover**: `rgba(59, 130, 246, 0.08)`
- **Zebra Stripe (Even Rows)**: `rgba(0, 0, 0, 0.02)`
- **Border Color**: `#e5e7eb` (rgb(229, 231, 235))

### Text Colors
- **Header Text**: `#1f2937` (Dark Gray)
- **Body Text**: `#374151` (Medium Gray)
- **Secondary Text**: `#6b7280` (Light Gray)

---

## Typography

### Table Headers
```css
font-weight: 600 (Semi-Bold)
font-size: 0.875rem (14px)
text-transform: uppercase
letter-spacing: 0.05em
color: #1f2937
```

### Table Cells
```css
font-weight: 400 (Regular)
font-size: 0.875rem (14px)
color: #374151
line-height: 1.25rem
```

---

## Spacing System

### Desktop (≥ 1200px)
- **Table Container Padding**: 20px
- **Cell Padding**: 16px
- **Header Padding**: 16px 16px 12px
- **Action Button Gap**: 8px

### Tablet (600px - 899px)
- **Table Container Padding**: 16px
- **Cell Padding**: 12px
- **Header Padding**: 12px 12px 10px
- **Action Button Gap**: 6px

### Mobile (< 600px)
- **Table Container Padding**: 12px
- **Cell Padding**: 8px
- **Header Padding**: 8px 8px 6px
- **Action Button Gap**: 4px

---

## Shadows & Borders

### Container Shadow
```css
box-shadow: 
  0 1px 3px 0 rgba(0, 0, 0, 0.1),
  0 1px 2px 0 rgba(0, 0, 0, 0.06)
```

### Container Border
```css
border: 1px solid #e5e7eb
border-radius: 12px (Desktop) / 8px (Mobile)
```

### Table Borders
```css
border-bottom: 2px solid rgba(59, 130, 246, 0.2) /* Header */
border-bottom: 1px solid #e5e7eb /* Rows */
```

---

## Interactive States

### Row Hover
```css
transform: translateX(2px)
background-color: rgba(59, 130, 246, 0.08)
transition: all 0.2s ease
```

### Action Button Hover
```css
transform: scale(1.05)
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
transition: all 0.2s ease
```

### Action Button Colors (with opacity on hover)

#### Primary (Edit)
```css
background-color: rgba(59, 130, 246, 0.1)
hover: rgba(59, 130, 246, 0.2)
icon-color: #3b82f6
```

#### Error (Delete)
```css
background-color: rgba(239, 68, 68, 0.1)
hover: rgba(239, 68, 68, 0.2)
icon-color: #ef4444
```

#### Info (View)
```css
background-color: rgba(6, 182, 212, 0.1)
hover: rgba(6, 182, 212, 0.2)
icon-color: #06b6d4
```

#### Success
```css
background-color: rgba(16, 185, 129, 0.1)
hover: rgba(16, 185, 129, 0.2)
icon-color: #10b981
```

#### Warning
```css
background-color: rgba(245, 158, 11, 0.1)
hover: rgba(245, 158, 11, 0.2)
icon-color: #f59e0b
```

---

## Custom Scrollbar

### Desktop Scrollbar
```css
width: 8px
height: 8px
background: #f3f4f6
border-radius: 4px

/* Thumb */
background: #d1d5db
border-radius: 4px
hover: background: #9ca3af
```

### Mobile Scrollbar
```css
width: 4px
height: 4px
/* Minimal for touch devices */
```

---

## Responsive Column Visibility

### Mobile (< 600px)
**Hidden Columns**:
- Producto: Tipo, Modelo
- MateriasPrima: None (compact table)
- Almacen: Ubicación
- Proveedor: RUC, Teléfono
- Empresa: RUC, Teléfono
- Usuario: Genero, Estado
- Rol: ID
- OrdenCompra: Fecha
- Reclamo: ID
- MovimientoInventario: Fecha, Cantidad

### Tablet (600px - 899px)
**Additional Hidden Columns**:
- Proveedor: País, Correo
- Empresa: Dirección, Correo
- Usuario: Correo, Teléfono
- MovimientoInventario: Motivo, ¿Confirmado?

---

## Empty State Design

### Layout
```css
padding: 48px 24px
text-align: center
```

### Icon
```css
font-size: 3rem (48px)
margin-bottom: 12px
line-height: 1
display: block
```

### Message
```css
font-size: 0.875rem (14px)
color: #6b7280 (Light Gray)
font-style: italic
```

### Icons by Module
- 📦 Producto, MateriasPrima, MovimientoInventario
- 🏢 Almacen, Empresa
- 🏭 Proveedor
- 👥 Usuario
- 🔐 Rol
- 📋 OrdenCompra
- 📢 Reclamo

---

## Pagination Styling

### Container
```css
display: flex
justify-content: center
flex-wrap: wrap
gap: 8px
margin-top: 16px
padding: 16px 0
```

### Button Size (Responsive)
```css
Desktop: medium (default)
Tablet: medium
Mobile: small
```

---

## Transitions & Animations

### Universal Transition
```css
transition: all 0.2s ease
```

### Applied To
- Row hover (background, transform)
- Action button hover (transform, background, box-shadow)
- Pagination hover
- Column sort indicators (if implemented)

---

## Accessibility Features

### Color Contrast
- **Text on Light**: ≥ 4.5:1 ratio (WCAG AA)
- **Headers**: Dark text on light gradient background
- **Icons**: Proper color weight for visibility

### Interactive Elements
- **Min Touch Target**: 44px × 44px (mobile)
- **Button Padding**: Adequate spacing
- **Hover States**: Clear visual feedback
- **Focus States**: Browser default outline preserved

### Semantic HTML
- Proper `<table>` structure
- `<thead>` and `<tbody>` usage
- `align` attribute for center-aligned cells
- Accessible button titles/tooltips

---

## Performance Optimizations

### CSS Properties
- Uses `transform` for animations (GPU-accelerated)
- Avoids expensive properties (box-shadow only on hover)
- Minimal repaints with `will-change` when needed

### Responsive Images
- Country flags loaded at appropriate resolution (320px width)
- Error handling for failed image loads

---

## Code Organization

### File Structure
```
src/
├── styles/
│   ├── theme.js              # Global theme configuration
│   ├── commonStyles.js        # General reusable styles
│   └── tableStyles.js         # Table-specific styles (285 lines)
├── components/
│   ├── EnhancedTable.js       # Reusable table component
│   └── ...
└── pages/
    ├── Producto.js            # ✅ Enhanced
    ├── MateriasPrima.js       # ✅ Enhanced
    ├── Almacen.js             # ✅ Enhanced
    ├── Proveedor.js           # ✅ Enhanced
    ├── Empresa.js             # ✅ Enhanced
    ├── Usuario.js             # ✅ Enhanced
    ├── Rol.js                 # ✅ Enhanced
    ├── OrdenCompra.js         # ✅ Enhanced
    ├── Reclamo.js             # ✅ Enhanced
    └── MovimientoInventario.js # ✅ Enhanced
```

### Import Pattern
```jsx
import { TableContainer, Typography } from '@mui/material';
import * as tableStyles from '../styles/tableStyles';
```

### Usage Pattern
```jsx
sx={tableStyles.enhancedTableContainer}
sx={tableStyles.enhancedTableHead}
sx={tableStyles.enhancedTableRow}
sx={tableStyles.enhancedTableCell}
sx={tableStyles.enhancedActionButton}
sx={tableStyles.hideColumnOnMobile}
sx={tableStyles.hideColumnOnTablet}
```

---

## Browser Support

### Modern Browsers (Fully Supported)
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile Browsers
- ✅ iOS Safari 14+
- ✅ Chrome Mobile 90+
- ✅ Samsung Internet 14+

### CSS Features Used
- ✅ CSS Grid (for pagination layout)
- ✅ Flexbox (for button groups)
- ✅ CSS Custom Properties (via MUI theme)
- ✅ CSS Transforms (for hover effects)
- ✅ CSS Transitions (for smooth animations)
- ✅ Media Queries (for responsive design)

---

**Last Updated**: 2025
**Design System Version**: 1.0
**Material-UI Version**: 7.0.2
