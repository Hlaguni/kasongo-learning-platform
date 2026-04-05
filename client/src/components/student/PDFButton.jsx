function PDFButton({ pdfUrl, onClick }) {
  const isAvailable = !!pdfUrl && pdfUrl !== "#";

  return (
    <button
      type="button"
      onClick={isAvailable ? onClick : undefined}
      disabled={!isAvailable}
      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
        isAvailable
          ? "bg-gray-900 text-white hover:bg-black shadow-sm"
          : "bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed"
      }`}
    >
      {/* Icon */}
      <span className="text-lg">📄</span>

      {/* Label */}
      <span>
        {isAvailable ? "Open PDF Notes" : "No PDF Available"}
      </span>
    </button>
  );
}

export default PDFButton;