function getEmbedUrl(videoUrl = "") {
  if (!videoUrl) return "";

  try {
    const url = new URL(videoUrl);

    // YouTube short link
    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    // YouTube watch link
    if (
      url.hostname.includes("youtube.com") &&
      (url.pathname === "/watch" || url.pathname === "/watch/")
    ) {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    // YouTube embed link already
    if (url.hostname.includes("youtube.com") && url.pathname.includes("/embed/")) {
      return videoUrl;
    }

    // Vimeo
    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean).pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
    }

    // Direct video file
    const lower = videoUrl.toLowerCase();
    if (
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm") ||
      lower.endsWith(".ogg")
    ) {
      return videoUrl;
    }

    return videoUrl;
  } catch {
    return "";
  }
}

function LessonViewer({ lesson }) {
  const videoUrl = lesson?.videoUrl || "";
  const embedUrl = getEmbedUrl(videoUrl);

  const isDirectVideo =
    embedUrl.endsWith(".mp4") ||
    embedUrl.endsWith(".webm") ||
    embedUrl.endsWith(".ogg");

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <p className="text-sm font-medium text-blue-600 mb-2">
        {lesson?.lessonNumber ? `Lesson ${lesson.lessonNumber}` : "Lesson"}
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {lesson?.title || "Untitled Lesson"}
      </h2>

      <div className="mb-6">
        {embedUrl ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-black">
            {isDirectVideo ? (
              <video controls className="w-full h-[220px] md:h-[420px]">
                <source src={embedUrl} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                src={embedUrl}
                title={lesson?.title || "Lesson Video"}
                className="w-full h-[220px] md:h-[420px]"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-2xl h-[220px] md:h-[260px] flex flex-col items-center justify-center text-center px-6">
            <div className="text-4xl mb-3">🎥</div>
            <p className="text-lg font-medium text-gray-700">No video available</p>
            <p className="text-sm text-gray-500 mt-2">
              This lesson may still include notes, PDFs, or a quiz below.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Lesson Notes
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap break-words">
          {lesson?.description || "No lesson notes available yet."}
        </p>
      </div>
    </div>
  );
}

export default LessonViewer;