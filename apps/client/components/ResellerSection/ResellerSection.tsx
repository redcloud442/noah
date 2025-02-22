const ResellerSection = () => {
  return (
    <div className="flex items-center justify-center w-full h-[600px] bg-zinc-950">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-white">Left Content</h1>
      </div>

      {/* Vertical Divider */}
      <div className="h-[80%] w-[2px] bg-white"></div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-white">Right Content</h1>
      </div>
    </div>
  );
};

export default ResellerSection;
