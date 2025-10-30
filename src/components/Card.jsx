import React from "react";
import theme from "../theme";

const Card = ({ title, children, className = "" }) => {
  return (
    <div className={`${theme.colors.background} ${theme.card} ${className}`}>
      {title && <h2 className="text-xl font-bold text-white mb-6">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
