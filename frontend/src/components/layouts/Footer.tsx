import { Dot } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-4 px-8 mt-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-slate-500">
        <div>
          Copyright © HRIS System 2026
        </div>
        <div className="flex items-center gap-1">
          <a href="javascript:void(0)" className=" hover:text-blue-600 !no-underline transition-colors">Privacy Policy</a>
          <Dot size={16} />
          <a href="javascript:void(0)" className=" hover:text-blue-600 !no-underline transition-colors">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;