"use client";

import { useState, type FormEvent } from "react";

/** Estado de la interacción: lo justo para que la persona vea qué está pasando. */
type FormState = "idle" | "submitting" | "success" | "error";

/** Forma mínima de la respuesta del endpoint que este formulario necesita leer. */
type LeadResponse = {
  ok?: boolean;
  error?: string;
  lead?: { id?: number };
  details?: { fieldErrors?: Record<string, string[] | undefined> };
};

/**
 * Formulario de contacto de una propiedad.
 *
 * Es el único componente de cliente del proyecto. Envía **una** petición al endpoint real, deshabilita
 * el botón mientras está en vuelo (un doble clic dentro de la misma interacción no puede duplicar el
 * envío) y muestra el estado que devuelve el servidor: la referencia que genera la base en el éxito y
 * el motivo del rechazo en el error. La validación de verdad vive en el servidor; aquí no se duplican
 * reglas de negocio.
 */
export function LeadForm({ propertyId }: { propertyId: number }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") {
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("submitting");
    setMessage("");
    setFieldErrors({});

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          source: "WEB",
        }),
      });
      const payload = (await response.json().catch(() => null)) as LeadResponse | null;

      if (response.ok && payload?.ok === true && typeof payload.lead?.id === "number") {
        setState("success");
        setMessage(`Gracias, recibimos tu solicitud. Referencia #${payload.lead.id}.`);
        form.reset();
        return;
      }

      setState("error");
      setMessage(`${payload?.error ?? "No se pudo enviar la solicitud"}. Revisa los datos.`);
      const errors = payload?.details?.fieldErrors ?? {};
      setFieldErrors(
        Object.fromEntries(
          Object.entries(errors).map(([field, list]) => [
            field,
            typeof list?.[0] === "string" ? list[0] : "Revisa este campo",
          ]),
        ),
      );
    } catch {
      setState("error");
      setMessage("No se pudo enviar la solicitud. Revisa tu conexión e inténtalo de nuevo.");
    }
  }

  return (
    <form id="lead-form" className="lead-form" onSubmit={handleSubmit} noValidate>
      <div className="lead-form-separator" />
      <label htmlFor="lead-name">Nombre</label>
      <input id="lead-name" name="name" type="text" autoComplete="name" />
      {fieldErrors.name && <span className="lead-field-error">{fieldErrors.name}</span>}

      <label htmlFor="lead-phone">Teléfono</label>
      <input id="lead-phone" name="phone" type="tel" autoComplete="tel" />
      {fieldErrors.phone && <span className="lead-field-error">{fieldErrors.phone}</span>}

      <label htmlFor="lead-email">Correo (opcional)</label>
      <input id="lead-email" name="email" type="email" autoComplete="email" />
      {fieldErrors.email && <span className="lead-field-error">{fieldErrors.email}</span>}

      <label htmlFor="lead-message">Mensaje (opcional)</label>
      <textarea id="lead-message" name="message" rows={3} />

      <button id="lead-submit" className="button button-primary" type="submit" disabled={state === "submitting"}>
        {state === "submitting" ? "Enviando…" : "Solicitar información"}
      </button>

      {message !== "" && (
        <p
          id="lead-status"
          className={`lead-status ${state === "success" ? "ok" : "error"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
