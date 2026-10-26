const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 bg-gray-950 py-3 px-4 sm:px-6 text-center text-gray-400 text-xs border-t border-gray-800">
      © {currentYear} Tapsure. All rights reserved.
    </footer>
  );
};

export default Footer;
