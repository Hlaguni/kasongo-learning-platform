import { useEffect, useMemo, useState } from "react";

const initialFormState = {
  title: "",
  grade: "",
  subject: "",
  topic: "",
  lessonNumber: 1,
  term: 1,
  order: 1,
  videoUrl: "",
  pdfUrl: "",
  description: "",
  isPublished: true,
  isActive: true,
};

function LessonForm({
  initialData = null,
  grades = [],
  subjects = [],
  topics = [],
  lessons = [],
  onSubmit,
  onCancel,
  submitting = false,
}) {
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        grade: initialData.grade?._id || initialData.grade || "",
        subject: initialData.subject?._id || initialData.subject || "",
        topic: initialData.topic?._id || initialData.topic || "",
        lessonNumber: initialData.lessonNumber ?? 1,
        term: initialData.term ?? 1,
        order: initialData.order ?? initialData.lessonNumber ?? 1,
        videoUrl: initialData.videoUrl || "",
        pdfUrl: initialData.pdfUrl || "",
        description: initialData.description || "",
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

  const filteredSubjects = useMemo(() => {
    if (!formData.grade) return [];

    return subjects.filter((subject) => {
      const subjectGradeId =
        subject.grade?._id || subject.grade || subject.gradeId;
      return String(subjectGradeId) === String(formData.grade);
    });
  }, [subjects, formData.grade]);

  const filteredTopics = useMemo(() => {
    if (!formData.subject) return [];

    return topics.filter((topic) => {
      const topicSubjectId =
        topic.subject?._id || topic.subject || topic.subjectId;
      return String(topicSubjectId) === String(formData.subject);
    });
  }, [topics, formData.subject]);

  const selectedTopic = useMemo(() => {
    return filteredTopics.find(
      (topic) => String(topic._id || topic.id) === String(formData.topic)
    );
  }, [filteredTopics, formData.topic]);

  const computedLessonNumber = useMemo(() => {
    if (!formData.topic) return 1;

    const relatedLessons = lessons.filter((lesson) => {
      const lessonTopicId = lesson.topic?._id || lesson.topic || lesson.topicId;
      return String(lessonTopicId) === String(formData.topic);
    });

    if (initialData?._id) {
      return formData.lessonNumber || 1;
    }

    const highestLessonNumber = relatedLessons.reduce((max, lesson) => {
      const currentNumber = Number(lesson.lessonNumber ?? lesson.order ?? 0);
      return currentNumber > max ? currentNumber : max;
    }, 0);

    return highestLessonNumber + 1;
  }, [lessons, formData.topic, formData.lessonNumber, initialData]);

  useEffect(() => {
    if (!initialData && formData.topic) {
      setFormData((prev) => ({
        ...prev,
        lessonNumber: computedLessonNumber,
        order: computedLessonNumber,
      }));
    }
  }, [computedLessonNumber, initialData, formData.topic]);

  useEffect(() => {
    if (selectedTopic) {
      setFormData((prev) => ({
        ...prev,
        term: Number(selectedTopic.term) || 1,
      }));
    }
  }, [selectedTopic]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const updatedValue = type === "checkbox" ? checked : value;

      if (name === "grade") {
        return {
          ...prev,
          grade: updatedValue,
          subject: "",
          topic: "",
          term: 1,
          lessonNumber: 1,
          order: 1,
        };
      }

      if (name === "subject") {
        return {
          ...prev,
          subject: updatedValue,
          topic: "",
          term: 1,
          lessonNumber: 1,
          order: 1,
        };
      }

      if (name === "topic") {
        return {
          ...prev,
          topic: updatedValue,
        };
      }

      return {
        ...prev,
        [name]: updatedValue,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.title.trim() ||
      !formData.grade ||
      !formData.subject ||
      !formData.topic
    ) {
      return;
    }

    onSubmit?.({
      title: formData.title.trim(),
      grade: formData.grade,
      subject: formData.subject,
      topic: formData.topic,
      lessonNumber: Number(formData.lessonNumber) || 1,
      term: Number(formData.term) || 1,
      order: Number(formData.order) || Number(formData.lessonNumber) || 1,
      videoUrl: formData.videoUrl.trim(),
      pdfUrl: formData.pdfUrl.trim(),
      description: formData.description.trim(),
      isPublished: formData.isPublished,
      isActive: formData.isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {initialData ? "Edit Lesson" : "Create Lesson"}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Select the academic structure first. Lesson number and term are filled
          automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Introduction to Algebra"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade
          </label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select grade</option>
            {grades.map((grade) => (
              <option key={grade._id || grade.id} value={grade._id || grade.id}>
                {grade.name || `Grade ${grade.value}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={!formData.grade}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            required
          >
            <option value="">Select subject</option>
            {filteredSubjects.map((subject) => (
              <option
                key={subject._id || subject.id}
                value={subject._id || subject.id}
              >
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <select
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            disabled={!formData.subject}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            required
          >
            <option value="">Select topic</option>
            {filteredTopics.map((topic) => (
              <option key={topic._id || topic.id} value={topic._id || topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Number
          </label>
          <input
            type="number"
            name="lessonNumber"
            value={formData.lessonNumber}
            readOnly
            className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700 outline-none"
          />
          <p className="mt-2 text-xs text-gray-500">
            Generated automatically from the selected topic.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Term
          </label>
          <input
            type="number"
            name="term"
            value={formData.term}
            readOnly
            className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-700 outline-none"
          />
          <p className="mt-2 text-xs text-gray-500">
            Auto-filled from the selected topic.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video URL
          </label>
          <input
            type="text"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="Paste video URL"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF URL
          </label>
          <input
            type="text"
            name="pdfUrl"
            value={formData.pdfUrl}
            onChange={handleChange}
            placeholder="Paste PDF URL"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          placeholder="Write a short lesson description"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            className="rounded"
          />
          Published
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="rounded"
          />
          Active
        </label>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
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
            ? "Update Lesson"
            : "Create Lesson"}
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

export default LessonForm;