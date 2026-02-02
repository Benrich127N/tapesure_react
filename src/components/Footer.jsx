const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black shadow-inner py-4 text-center text-gray-500 text-sm border-t border-gray-900">
      © {currentYear} Tapsure. All rights reserved.
    </footer>
  );
};

export default Footer;