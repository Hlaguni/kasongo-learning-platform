function MCQQuestionCard({
  question,
  selectedOption,
  onSelect,
  questionNumber,
}) {
  const questionId = question._id || question.id;
  const questionText =
    question.questionText || question.question || question.text || "";
  const options = Array.isArray(question.options) ? question.options : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="mb-5">
        <p className="text-sm font-medium text-blue-700 mb-2">
          Question {questionNumber}
        </p>

        <h2 className="text-lg md:text-xl font-semibold text-gray-900 leading-relaxed">
          {questionText}
        </h2>
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

                  <span className="text-gray-800 leading-relaxed">
                    {option}
                  </span>
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