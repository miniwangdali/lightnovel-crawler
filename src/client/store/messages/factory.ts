import uuidv1 from "uuid/v1";

export interface MessageType {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  type: "success" | "warning" | "error" | "normal";
  timeout: number;
}

export function Message(m: Partial<MessageType>): MessageType {
  return {
    id: uuidv1(),
    title: m.title || "",
    description: m.description,
    type: m.type || "normal",
    timeout:
      typeof m.timeout === "number" ? m.timeout : m.type === "error" ? 0 : 5000
  };
}
