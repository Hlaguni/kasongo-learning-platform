import { useState } from "react";
import { updateEnrollment } from "../../api/enrollmentApi";

function EnrollmentsTable({ enrollments = [], onEnrollmentUpdated }) {
  const [editingRows, setEditingRows] = useState({});
  const [savingId, setSavingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmExpire, setConfirmExpire] = useState({
    open: false,
    enrollmentId: "",
  });

  if (!enrollments.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-500">
        No enrollments found.
      </div>
    );
  }

  const getPaymentBadge = (paymentStatus) => {
    if (paymentStatus === "paid") return "bg-green-100 text-green-700";
    if (paymentStatus === "pending") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getAccessBadge = (accessStatus) => {
    if (accessStatus === "active") return "bg-green-100 text-green-700";
    if (accessStatus === "expired") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const getDraft = (enrollmentId, enrollment) => {
    return editingRows[enrollmentId] || {
      paymentStatus: enrollment.paymentStatus ?? "pending",
      accessStatus: enrollment.accessStatus ?? "inactive",
      amountPaid: Number(enrollment.amountPaid ?? 0),
    };
  };

  const clearMessages = () => {
    setActionError("");
    setSuccessMessage("");
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 2500);
  };

  const refreshAfterFeedback = () => {
    if (onEnrollmentUpdated) {
      setTimeout(() => {
        onEnrollmentUpdated();
      }, 1200);
    }
  };

  const handleFieldChange = (enrollmentId, field, value, enrollment) => {
    const currentDraft = getDraft(enrollmentId, enrollment);

    setEditingRows((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...currentDraft,
        [field]: field === "amountPaid" ? Number(value) : value,
      },
    }));
  };

  const handleSave = async (enrollmentId, enrollment) => {
    try {
      setSavingId(enrollmentId);
      clearMessages();

      const draft = getDraft(enrollmentId, enrollment);

      await updateEnrollment(enrollmentId, {
        paymentStatus: draft.paymentStatus,
        accessStatus: draft.accessStatus,
        amountPaid: Number(draft.amountPaid ?? 0),
      });

      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[enrollmentId];
        return updated;
      });

      showSuccess("Enrollment updated successfully.");
      refreshAfterFeedback();
    } catch (err) {
      console.error("Failed to update enrollment:", err);
      setActionError(
        err.response?.data?.message || "Failed to update enrollment."
      );
    } finally {
      setSavingId("");
    }
  };

  const handleQuickAction = async (enrollmentId, payload, successText) => {
    try {
      setSavingId(enrollmentId);
      clearMessages();

      await updateEnrollment(enrollmentId, payload);

      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[enrollmentId];
        return updated;
      });

      showSuccess(successText || "Enrollment updated successfully.");
      refreshAfterFeedback();
    } catch (err) {
      console.error("Failed to update enrollment:", err);
      setActionError(
        err.response?.data?.message || "Failed to update enrollment."
      );
    } finally {
      setSavingId("");
    }
  };

  const openExpireConfirm = (enrollmentId) => {
    setConfirmExpire({
      open: true,
      enrollmentId,
    });
  };

  const closeExpireConfirm = () => {
    setConfirmExpire({
      open: false,
      enrollmentId: "",
    });
  };

  const confirmExpireAction = async () => {
    const { enrollmentId } = confirmExpire;
    if (!enrollmentId) return;

    await handleQuickAction(
      enrollmentId,
      { accessStatus: "expired" },
      "Enrollment access expired successfully."
    );

    closeExpireConfirm();
  };

  return (
    <div className="space-y-4">
      {actionError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {actionError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          {successMessage}
        </div>
      ) : null}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Subject
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Grade
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Payment
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Access
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Amount Paid
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Current Status
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Quick Actions
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Created
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Save
                </th>
              </tr>
            </thead>

            <tbody>
              {enrollments.map((enrollment, index) => {
                const enrollmentId = enrollment._id || enrollment.id;
                const studentName =
                  enrollment.student?.name || enrollment.studentName || "Student";
                const subjectName =
                  enrollment.subject?.name ||
                  enrollment.subjectName ||
                  enrollment.subject ||
                  "-";
                const gradeName =
                  enrollment.grade?.name ||
                  enrollment.grade?.title ||
                  enrollment.gradeName ||
                  enrollment.grade ||
                  "-";

                const paymentStatus = enrollment.paymentStatus || "pending";
                const accessStatus = enrollment.accessStatus || "inactive";
                const amountPaid = Number(enrollment.amountPaid ?? 0);

                const createdAt = enrollment.createdAt
                  ? new Date(enrollment.createdAt).toLocaleDateString()
                  : "-";

                const draft = getDraft(enrollmentId, enrollment);
                const isSaving = savingId === enrollmentId;

                return (
                  <tr
                    key={enrollmentId || `${studentName}-${subjectName}-${index}`}
                    className="border-b border-gray-100 last:border-b-0 align-top"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {studentName}
                    </td>

                    <td className="px-4 py-3 text-gray-700">{subjectName}</td>

                    <td className="px-4 py-3 text-gray-700">{gradeName}</td>

                    <td className="px-4 py-3">
                      <select
                        value={draft.paymentStatus}
                        onChange={(e) =>
                          handleFieldChange(
                            enrollmentId,
                            "paymentStatus",
                            e.target.value,
                            enrollment
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={draft.accessStatus}
                        onChange={(e) =>
                          handleFieldChange(
                            enrollmentId,
                            "accessStatus",
                            e.target.value,
                            enrollment
                          )
                        }
                        className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                      >
                        <option value="inactive">inactive</option>
                        <option value="active">active</option>
                        <option value="expired">expired</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={draft.amountPaid}
                        onChange={(e) =>
                          handleFieldChange(
                            enrollmentId,
                            "amountPaid",
                            e.target.value,
                            enrollment
                          )
                        }
                        className="w-24 border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${getPaymentBadge(
                            paymentStatus
                          )}`}
                        >
                          {paymentStatus}
                        </span>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${getAccessBadge(
                            accessStatus
                          )}`}
                        >
                          {accessStatus}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            handleQuickAction(
                              enrollmentId,
                              {
                                paymentStatus: "paid",
                                amountPaid: Number(draft.amountPaid ?? amountPaid),
                              },
                              "Enrollment marked as paid."
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60 text-xs"
                        >
                          Mark Paid
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            handleQuickAction(
                              enrollmentId,
                              { accessStatus: "active" },
                              "Enrollment access activated."
                            )
                          }
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 text-xs"
                        >
                          Activate
                        </button>

                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => openExpireConfirm(enrollmentId)}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60 text-xs"
                        >
                          Expire
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-700">{createdAt}</td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSave(enrollmentId, enrollment)}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {confirmExpire.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Confirm Expire Access
            </h3>

            <p className="text-gray-600 mb-6">
              Are you sure you want to mark this enrollment as expired? This may
              remove the student’s access to the subject.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeExpireConfirm}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmExpireAction}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Confirm Expire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnrollmentsTable;