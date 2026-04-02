/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Транспилируем Ant Design и все его ESM-зависимости из rc-*
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/icons-svg',
    'rc-input',
    'rc-util',
    'rc-pagination',
    'rc-picker',
    'rc-select',
    'rc-menu',
    'rc-dropdown',
    'rc-dialog',
    'rc-field-form',
    'rc-input-number',
    'rc-tree',
    'rc-table',
    'rc-tabs',
    'rc-upload',
    'rc-resize-observer',
    'rc-image',
    'rc-segmented',
    'rc-virtual-list',
    'rc-notification'
  ]
};

export default nextConfig;

