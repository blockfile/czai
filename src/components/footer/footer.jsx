import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

function Footer() {
    return (
        <div className="w-full fixed bottom-0 bg-amber-300 bg-opacity-80 text-white py-2 flex justify-center items-center gap-8 z-50">
            <a
                href=" https://x.com/NovaAI_x"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition">
                <FaXTwitter size={28} />
            </a>
            <a
                href="https://t.me/NovaA_Portal"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition">
                <FaTelegramPlane size={28} />
            </a>
        </div>
    );
}

export default Footer;
