import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../Contexts/useHook";
import Logo from "../../../../assets/images/FinancialLogo.png";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hoverClose, setHoverClose] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const [showCloseIcon, setShowCloseIcon] = useState(false);
  const { openPage } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);

    setShowCloseIcon(!isOpen);
  };


  const toggleHoverClose = () => {
    setHoverClose(!hoverClose);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!isSmallScreen) {
      setIsOpen(false);

      setShowCloseIcon(false);

    }
  }, [isSmallScreen]);

  return (
    <div className="max-w-[300px] fixed top-0 left-0 w-1/6 sm:min-w-48 h-screen z-30 transition duration-500 ">

      <div className="flex items-center justify-between">
        {isSmallScreen && (
          <IconButton onClick={toggleSidebar}>
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}
        <div className={`fixed left-0 top-0 bottom-0 bg-white shadow-md w-60 transform transition-transform duration-300 flex flex-col justify-between ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div style={{ height: isSmallScreen && scrollPosition > 0 ? '160px' : '0px' }} className={`fixed bg-green_ w-full`}></div>
          <div className="border-bottom">
            <div className="flex justify-center items-center h-20 mb-16 ">
              <img
                src={Logo}
                className="w-[90px] mt-24 z-30 pb-10 cursor-pointer"
                alt="Logo"
                onClick={() => { navigate("/"); }}
              />
            </div>
            <div className="text-center space-y-4 pt-12 border-t-2 border-green_ overflow-y-auto">
              <button className={`py-2 w-4/5 text-center hover:bg-green__  hover:text-gray_light rounded-lg text-xs text-gray-400 ${openPage === "Home" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => { navigate("/"); }}>
                Home
              </button>
              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-xs text-gray-400 mb-2 ${openPage === "Loans" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => { navigate("/admin/loanlist"); }}>
                Loan
              </button>
              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-xs text-gray-400 mb-2 ${openPage === "Payments" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => navigate("/admin/paymentlist")}>
                Payment
              </button>
              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-xs text-gray-400 mb-2 ${openPage === "Customers" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => navigate("/admin/customerlist")}>
                Customer
              </button>

              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-xs text-gray-400 mb-2 ${openPage === "Admins" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => navigate("/admin/adminlist")}>
                Admin
              </button>
            </div>
          </div>
          <div className="text-center space-y-4 py-10 border-t-2 border-green_">
            <button className="py-2 w-4/5 text-center bg-green__ hover:bg-green-200 text-gray_light hover:font-bold rounded-lg text-sm hover:text-gray-700 mb-2" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div className="absolute border top-0 mt-[-10px] p-0 left-0 z-30">
            {showCloseIcon && (
              <IconButton onClick={toggleSidebar}>
                <span
                  className={`text-3xl font-semibold ${hoverClose ? '' : 'text-black'}`}
                  onMouseEnter={toggleHoverClose}
                  onMouseLeave={toggleHoverClose}
                >
                  x
                </span>
              </IconButton>
            )}
          </div>
        </div>
      </div>

      <div className="w-full hidden sm:block h-screen">
        <div className=" shadow-2xl  h-full flex flex-col justify-between">
          <div className="">
            <div className="flex justify-center items-center h-20 mb-16 ">
              <img
                src={Logo}
                className="w-[90px] mt-24 z-30 pb-10 cursor-pointer "
                alt="Logo"
                onClick={() => navigate("/")}
              />
            </div>
            <div className="text-center space-y-3 pt-12 border-t-2 border-green_ ">
              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-sm text-gray-400 ${openPage === "Home" ? " font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => navigate("/")}>
                Home
              </button>
              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-sm text-gray-400 mb-2 ${openPage === "Loans" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => navigate("/admin/loanlist")}>
                Loan
              </button>

              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-sm text-gray-400 mb-2 ${openPage === "Payments" ? "font-extrabold text-gray-500 text-lg" : ""} `} onClick={() => navigate("/admin/paymentlist")}>
                Payment
              </button>
              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-sm text-gray-400 mb-2 ${openPage === "Customers" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => navigate("/admin/customerlist")}>
                Customer
              </button>

              <button className={`py-2 w-4/5 text-center hover:bg-green__ hover:text-gray_light hover:font-bold rounded-lg text-sm text-gray-400 mb-2 ${openPage === "Admins" ? "font-extrabold text-gray-500 text-lg" : ""}`} onClick={() => navigate("/admin/adminlist")}>
                Admin
              </button>
            </div>
          </div>
          <div className="text-center space-y-4 py-10 border-t-2 border-green_">
            <button className="py-2 w-4/5 text-center bg-green__ hover:bg-green-200 text-gray_light hover:font-bold rounded-lg text-sm hover:text-gray-700 mb-2" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
