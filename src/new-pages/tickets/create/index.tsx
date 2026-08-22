import { Navigate } from "react-router-dom";

/** إضافة التذكرة أصبحت سايدبار من قائمة التذاكر (Figma 655:35717). */
const CreateTicketPage = () => (
  <Navigate to="/tickets" replace state={{ openCreateTicket: true }} />
);

export default CreateTicketPage;
