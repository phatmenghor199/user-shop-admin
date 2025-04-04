import { Loader2 } from "lucide-react";
import React from "react";

const Laoding = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Laoding;
