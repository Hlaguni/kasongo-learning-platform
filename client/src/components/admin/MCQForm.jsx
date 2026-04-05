import { useEffect, useMemo, useState } from "react";

const createEmptyQuestion = () => ({
  questionText: "",
  questionImageUrl: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
});

const initialFormState = {
  lesson: "",
  instructions: "",
  questions: [createEmptyQuestion()],
  isPublished: true,
  isActive: true,
};

function MCQForm({
  initialData = null,
  lessons = [],
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        lesson: initialData.lesson?._id || initialData.lesson || "",
        instructions: initialData.instructions || "",
        questions:
          Array.isArray(initialData.questions) && initialData.questions.length > 0
            ? initialData.questions.map((question) => ({
                questionText: question.questionText || "",
                questionImageUrl: question.questionImageUrl || "",
                options:
                  Array.isArray(question.options) && question.options.length >= 2
                    ? [...question.options]
                    : ["", "", "", ""],
                correctAnswer:
                  typeof question.correctAnswer === "number"
                    ? question.correctAnswer
                    : 0,
                explanation: question.explanation || "",
              }))
            : [createEmptyQuestion()],
        isPublished:
          typeof initialData.isPublished === "boolean"
            ? initialData.isPublished
            : true,
        isActive:
          typeof initialData.isActive === "boolean"
            ? initialData.isActive
            : true,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [initialData]);

  const lessonOptions = useMemo(() => {
    return lessons.map((lesson) => ({
      value: lesson._id,
      label: `${lesson.title || "Untitled Lesson"}${
        lesson.subject?.name ? ` • ${lesson.subject.name}` : ""
      }${lesson.topic?.name ? ` • ${lesson.topic.name}` : ""}`,
    }));
  }, [lessons]);

  const handleTopLevelChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionFieldChange = (questionIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              [field]: field === "correctAnswer" ? Number(value) : value,
            }
          : question
      ),
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
        };
      }),
    }));
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  };

  const handleRemoveQuestion = (questionIndex) => {
    setFormData((prev) => {
      if (prev.questions.length === 1) return prev;

      return {
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex),
      };
    });
  };

  const handleAddOption = (questionIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) => {
        if (index !== questionIndex) return question;

        return {
          ...question,
          options: [...question.options, ""],
        };
      }),
    }));
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, index) => {
        if (index !== questionIndex) return question;
        if (question.options.length <= 2) return question;

        const updatedOptions = question.options.filter(
          (_, currentIndex) => currentIndex !== optionIndex
        );

        let updatedCorrectAnswer = question.correctAnswer;

        if (optionIndex === question.correctAnswer) {
          updatedCorrectAnswer = 0;
        } else if (optionIndex < question.correctAnswer) {
          updatedCorrectAnswer = question.correctAnswer - 1;
        }

        if (updatedCorrectAnswer >= updatedOptions.length) {
          updatedCorrectAnswer = 0;
        }

        return {
          ...question,
          options: updatedOptions,
          correctAnswer: updatedCorrectAnswer,
        };
      }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanedQuestions = formData.questions.map((question) => {
      const cleanedOptions = question.options
        .map((option) => option.trim())
        .filter(Boolean);

      let correctedAnswerIndex = Number(question.correctAnswer);
      if (correctedAnswerIndex >= cleanedOptions.length) {
        correctedAnswerIndex = 0;
      }

      return {
        questionText: question.questionText.trim(),
        questionImageUrl: question.questionImageUrl.trim(),
        options: cleanedOptions,
        correctAnswer: correctedAnswerIndex,
        explanation: question.explanation.trim(),
      };
    });

    const hasInvalidQuestion = cleanedQuestions.some((question) => {
      const hasQuestionContent =
        question.questionText.length > 0 || question.questionImageUrl.length > 0;

      return !hasQuestionContent || question.options.length < 2;
    });

    if (!formData.lesson || hasInvalidQuestion) {
      return;
    }

    onSubmit?.({
      lesson: formData.lesson,
      instructions: formData.instructions.trim(),
      questions: cleanedQuestions,
      isPublished: formData.isPublished,
      isActive: formData.isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit MCQ" : "Create MCQ"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          You can type maths naturally here. Examples:
          <span className="block mt-1">
            x^2 - 5x + 6 = 0, √49, 3/4, sin(30°), (a+b)^2, 2x + 3 = 11
          </span>
          <span className="block mt-1">
            You can also type LaTeX-style text if you want, for example:
            \frac{"{a}"}{"{b}"}, x_1, x^2
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson
          </label>
          <select
            name="lesson"
            value={formData.lesson}
            onChange={handleTopLevelChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a lesson</option>
            {lessonOptions.map((lesson) => (
              <option key={lesson.value} value={lesson.value}>
                {lesson.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleTopLevelChange}
            />
            Published
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleTopLevelChange}
            />
            Active
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          name="instructions"
          value={formData.instructions}
          onChange={handleTopLevelChange}
          rows="3"
          spellCheck={false}
          placeholder="Answer all questions carefully."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="space-y-5">
        {formData.questions.map((question, questionIndex) => (
          <div
            key={questionIndex}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Question {questionIndex + 1}
              </h4>

              <button
                type="button"
                onClick={() => handleRemoveQuestion(questionIndex)}
                className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium"
              >
                Remove Question
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={question.questionText}
                onChange={(e) =>
                  handleQuestionFieldChange(
                    questionIndex,
                    "questionText",
                    e.target.value
                  )
                }
                rows="4"
                spellCheck={false}
                placeholder="Example: Solve x^2 - 5x + 6 = 0"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y whitespace-pre-wrap"
              />
              <p className="mt-2 text-xs text-gray-500">
                Maths symbols and equations are supported as typed text.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Image URL
              </label>
              <input
                type="text"
                value={question.questionImageUrl}
                onChange={(e) =>
                  handleQuestionFieldChange(
                    questionIndex,
                    "questionImageUrl",
                    e.target.value
                  )
                }
                placeholder="Optional question image URL"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Options
                </label>

                <button
                  type="button"
                  onClick={() => handleAddOption(questionIndex)}
                  className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium"
                >
                  Add Option
                </button>
              </div>

              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <textarea
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          e.target.value
                        )
                      }
                      rows="2"
                      spellCheck={false}
                      placeholder={`Option ${optionIndex + 1}`}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y whitespace-pre-wrap"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveOption(questionIndex, optionIndex)
                    }
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correct Answer
              </label>
              <select
                value={question.correctAnswer}
                onChange={(e) =>
                  handleQuestionFieldChange(
                    questionIndex,
                    "correctAnswer",
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                {question.options.map((_, optionIndex) => (
                  <option key={optionIndex} value={optionIndex}>
                    Option {optionIndex + 1}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                The backend expects the correct answer as a zero-based option index.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation
              </label>
              <textarea
                value={question.explanation}
                onChange={(e) =>
                  handleQuestionFieldChange(
                    questionIndex,
                    "explanation",
                    e.target.value
                  )
                }
                rows="3"
                spellCheck={false}
                placeholder="Explain why the selected answer is correct"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y whitespace-pre-wrap"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAddQuestion}
          className="px-4 py-3 rounded-xl bg-blue-50 text-blue-700 font-medium hover:bg-blue-100"
        >
          Add Question
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
            ? "Update MCQ"
            : "Create MCQ"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl bg-gray-100 text-gray-800 font-medium hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default MCQForm;