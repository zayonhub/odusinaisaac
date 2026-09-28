import './globals.css';

export const metadata = {
  title: { default: 'Odusina Isaac | Brand Identity & Visual Designer', template: '%s | Odusina Isaac' },
  description: 'Brand identity, packaging, campaigns and digital design by Odusina Isaac.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
