import { useNavigate } from "react-router-dom";

const Button = ({ buttonName }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/admin/add-${buttonName?.toLowerCase()}`)
    }


    return (
        <div className="flex justify-end items-center mt-4 md:mt-4 px-6 space-x-12 min-w-xs">
            <button
                onClick={handleClick}
                className="min-w-36 bg-green-200 text-black_  text-sm md:text-base font-semibold py-2 px-4 md:px-6 rounded-lg hover:outline-none hover:ring-2 hover:ring-green-500 hover:ring-opacity-50 transition duration-300 ease-in-out hover:bg-green__ hover:text-white"
            >
                {`Add ${buttonName}`}
            </button>
        </div>
    );

};
export default Button;
