import { useEffect, useMemo, useState } from "react";
import { createEnrollment } from "../../api/enrollmentApi";

function EnrollmentForm({
  grades = [],
  subjects = [],
  students = [],
  enrollments = [],
  onEnrollmentCreated,
}) {
  const [formData, setFormData] = useState({
    student: "",
    grade: "",
    subject: "",
    paymentStatus: "pending",
    accessStatus: "inactive",
    amountPaid: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const selectedStudentId = formData.student;
  const selectedGradeId = formData.grade;
  const selectedSubjectId = formData.subject;

  const filteredSubjects = useMemo(() => {
    if (!selectedGradeId) return [];

    return subjects.filter((subject) => {
      const subjectGradeId =
        typeof subject.grade === "string"
          ? subject.grade
          : subject.grade?._id || "";

      return subjectGradeId === selectedGradeId;
    });
  }, [subjects, selectedGradeId]);

  const duplicateEnrollment = useMemo(() => {
    if (!selectedStudentId || !selectedGradeId || !selectedSubjectId) {
      return null;
    }

    return enrollments.find((enrollment) => {
      const enrollmentStudentId =
        typeof enrollment.student === "string"
          ? enrollment.student
          : enrollment.student?._id || "";

      const enrollmentGradeId =
        typeof enrollment.grade === "string"
          ? enrollment.grade
          : enrollment.grade?._id || "";

      const enrollmentSubjectId =
        typeof enrollment.subject === "string"
          ? enrollment.subject
          : enrollment.subject?._id || "";

      return (
        enrollmentStudentId === selectedStudentId &&
        enrollmentGradeId === selectedGradeId &&
        enrollmentSubjectId === selectedSubjectId
      );
    });
  }, [enrollments, selectedStudentId, selectedGradeId, selectedSubjectId]);

  useEffect(() => {
    if (formData.paymentStatus === "paid" && formData.accessStatus !== "active") {
      setFormData((prev) => ({
        ...prev,
        accessStatus: "active",
      }));
    }

    if (
      (formData.paymentStatus === "pending" ||
        formData.paymentStatus === "failed") &&
      formData.accessStatus === "active"
    ) {
      setFormData((prev) => ({
        ...prev,
        accessStatus: "inactive",
      }));
    }
  }, [formData.paymentStatus, formData.accessStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setSuccessMessage("");

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === "amountPaid" ? Number(value) : value,
      };

      if (name === "grade") {
        updated.subject = "";
      }

      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      student: "",
      grade: "",
      subject: "",
      paymentStatus: "pending",
      accessStatus: "inactive",
      amountPaid: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (duplicateEnrollment) {
      setError("This student is already enrolled in the selected grade and subject.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        student: formData.student,
        grade: formData.grade,
        subject: formData.subject,
        paymentStatus: formData.paymentStatus,
        accessStatus: formData.accessStatus,
        amountPaid: Number(formData.amountPaid ?? 0),
      };

      await createEnrollment(payload);

      setSuccessMessage("Enrollment created successfully.");
      resetForm();

      if (onEnrollmentCreated) {
        await onEnrollmentCreated();
      }
    } catch (err) {
      console.error("Failed to create enrollment:", err);
      setError(err?.response?.data?.message || "Failed to create enrollment.");
    } finally {
      setSubmitting(false);
    }
  };

  const accessHelperText =
    formData.paymentStatus === "paid"
      ? "Access is automatically set to active because payment is marked as paid."
      : "Access is automatically kept inactive when payment is pending or failed.";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Create Enrollment
      </h3>

      {error ? (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {successMessage}
        </div>
      ) : null}

      {duplicateEnrollment ? (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          Duplicate warning: this student already has this enrollment.
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student
          </label>
          <select
            name="student"
            value={formData.student}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white"
          >
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade
          </label>
          <select
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white"
          >
            <option value="">Select grade</option>
            {grades.map((grade) => (
              <option key={grade._id} value={grade._id}>
                {grade.name || `Grade ${grade.value}` || grade.value}
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
            required
            disabled={!formData.grade}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white disabled:bg-gray-100 disabled:text-gray-400"
          >
            <option value="">
              {formData.grade ? "Select subject" : "Select grade first"}
            </option>
            {filteredSubjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white"
          >
            <option value="pending">pending</option>
            <option value="paid">paid</option>
            <option value="failed">failed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Status
          </label>
          <input
            type="text"
            value={formData.accessStatus}
            readOnly
            className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 capitalize"
          />
          <p className="text-xs text-gray-500 mt-2">{accessHelperText}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount Paid
          </label>
          <input
            type="number"
            min="0"
            name="amountPaid"
            value={formData.amountPaid}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl border border-gray-300"
          />
        </div>

        <div className="md:col-span-2 xl:col-span-3 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting || !!duplicateEnrollment}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Enrollment"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default EnrollmentForm;