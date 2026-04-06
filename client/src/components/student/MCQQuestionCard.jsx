import { BlockMath, InlineMath } from "react-katex";

function MCQQuestionCard({
  question,
  selectedOption,
  onSelect,
  questionNumber,
}) {
  const questionId = question._id || question.id;
  const questionText =
    question.questionText || question.question || question.text || "";
  const questionEquation = question.equation || "";
  const options = Array.isArray(question.options) ? question.options : [];

  const isLatexLike = (value) => {
    if (typeof value !== "string") return false;

    return (
      value.includes("\\frac") ||
      value.includes("\\sqrt") ||
      value.includes("^") ||
      value.includes("_") ||
      value.includes("\\times") ||
      value.includes("\\div") ||
      value.includes("\\pm") ||
      value.includes("\\left") ||
      value.includes("\\right") ||
      value.includes("=")
    );
  };

  const renderInlineContent = (value) => {
    if (typeof value !== "string") {
      return (
        <span className="text-gray-800 leading-relaxed">{String(value)}</span>
      );
    }

    if (isLatexLike(value)) {
      try {
        return (
          <span className="text-gray-800 leading-relaxed">
            <InlineMath math={value} />
          </span>
        );
      } catch {
        return <span className="text-gray-800 leading-relaxed">{value}</span>;
      }
    }

    return <span className="text-gray-800 leading-relaxed">{value}</span>;
  };

  const renderDollarWrappedMath = (text) => {
    const parts = text.split(/(\$.*?\$)/g);

    return (
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-3">
        {parts.map((part, index) => {
          if (part.startsWith("$") && part.endsWith("$")) {
            const math = part.slice(1, -1);

            try {
              return <InlineMath key={index} math={math} />;
            } catch {
              return <span key={index}>{part}</span>;
            }
          }

          return <span key={index}>{part}</span>;
        })}
      </h2>
    );
  };

  const renderQuestionText = (text) => {
    if (!text) return null;

    if (text.includes("$")) {
      return renderDollarWrappedMath(text);
    }

    if (!questionEquation && text.includes(":")) {
      const parts = text.split(":");
      const prefix = parts.shift()?.trim() || "";
      const suffix = parts.join(":").trim();

      if (suffix && isLatexLike(suffix)) {
        return (
          <div className="mb-3">
            {prefix && (
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-3">
                {prefix}:
              </h2>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 overflow-x-auto">
              <BlockMath math={suffix} />
            </div>
          </div>
        );
      }
    }

    if (!questionEquation && isLatexLike(text)) {
      try {
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 overflow-x-auto mb-3">
            <BlockMath math={text} />
          </div>
        );
      } catch {
        return (
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-3">
            {text}
          </h2>
        );
      }
    }

    return (
      <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed mb-3">
        {text}
      </h2>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-700 mb-2">
          Question {questionNumber}
        </p>

        {questionText && renderQuestionText(questionText)}

        {questionEquation && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 overflow-x-auto">
            <BlockMath math={questionEquation} />
          </div>
        )}
      </div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedOption === index;
          const optionLabel = String.fromCharCode(65 + index);

          return (
            <label
              key={index}
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={`question-${questionId}`}
                value={index}
                checked={isSelected}
                onChange={() => onSelect(questionId, index)}
                className="mt-1"
              />

              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {optionLabel}
                  </span>

                  <div className="text-gray-800 leading-relaxed overflow-x-auto">
                    {renderInlineContent(option)}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default MCQQuestionCard;