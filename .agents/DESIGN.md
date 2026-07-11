---
name: Bushido Academic
colors:
  surface: '#f1fcf7'
  surface-dim: '#d1ddd8'
  surface-bright: '#f1fcf7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ebf6f1'
  surface-container: '#e6f1ec'
  surface-container-high: '#e0ece6'
  surface-container-highest: '#dae7e1'
  on-surface: '#171d1a'
  on-surface-variant: '#3f4944'
  outline: '#6f7974'
  outline-variant: '#bec9c2'
  primary: '#1e5f41'
  on-primary: '#ffffff'
  primary-container: '#a8f1ca'
  on-primary-container: '#002112'
  secondary: '#4d6356'
  on-secondary: '#ffffff'
  secondary-container: '#cfe9d7'
  on-secondary-container: '#0a1f15'
  tertiary: '#3d6373'
  on-tertiary: '#ffffff'
  tertiary-container: '#c1e8fb'
  on-tertiary-container: '#001e2a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#410002'
typography:
  font-family: 'Space Grotesk', sans-serif
  display:
    large: { size: 57px, weight: 700, line-height: 64px }
    medium: { size: 45px, weight: 700, line-height: 52px }
    small: { size: 36px, weight: 700, line-height: 44px }
  headline:
    large: { size: 32px, weight: 600, line-height: 40px }
    medium: { size: 28px, weight: 600, line-height: 36px }
    small: { size: 24px, weight: 600, line-height: 32px }
  title:
    large: { size: 22px, weight: 500, line-height: 28px }
    medium: { size: 16px, weight: 500, line-height: 24px }
    small: { size: 14px, weight: 500, line-height: 20px }
  body:
    large: { size: 16px, weight: 400, line-height: 24px }
    medium: { size: 14px, weight: 400, line-height: 20px }
    small: { size: 12px, weight: 400, line-height: 16px }
  label:
    large: { size: 14px, weight: 500, line-height: 20px }
    medium: { size: 12px, weight: 500, line-height: 16px }
    small: { size: 11px, weight: 500, line-height: 16px }
spacing:
  margin-mobile: 16px
  margin-desktop: 40px
  gutter: 24px
  container-max: 1280px
roundness:
  none: 0px
  small: 4px
  medium: 8px
  large: 16px
  full: 9999px
---

# Bushido Academic Design System

## Tầm nhìn
Bushido Academic kết hợp tinh thần kỷ luật của Võ sĩ đạo (Bushido) với sự minh bạch của môi trường học thuật. Hệ thống sử dụng bảng màu xanh lục bảo (Emerald Green) làm chủ đạo, tượng trưng cho sự phát triển và trí tuệ.

## Thành phần chính
1. **Thẻ (Cards)**: Sử dụng độ bo góc `ROUND_FOUR` (8px) và viền mỏng `outline-variant` để tạo cảm giác tối giản, hiện đại.
2. **Nút bấm (Buttons)**: 
   - **Primary**: Nền xanh đậm, chữ trắng, hiệu ứng chuyển động nhẹ khi di chuột.
   - **Secondary**: Nền xanh nhạt, chữ xanh đậm.
3. **Điều hướng (Navigation)**: Thanh bên (Sidebar) cố định ở bên trái cho Desktop, cung cấp trải nghiệm học tập không bị gián đoạn.
4. **Trạng thái học tập**:
   - **Mastered**: Xanh lục đậm.
   - **Recalled**: Xanh lục nhạt.
   - **Partial**: Vàng cát.
   - **Forgot**: Xám đá.