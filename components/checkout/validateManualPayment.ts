export function validateManualPayment({
  reference,
  selectedMethod,
  phoneNumber,
  receiptImage,
}: {
  reference: string;
  selectedMethod: string;
  phoneNumber: string;
  receiptImage: string | null;
}): string | null {
  if (!reference.trim()) {
    return "Por favor ingresa el número de referencia o confirmación.";
  }
  if (selectedMethod === "PAGO_MOVIL" && !phoneNumber.trim()) {
    return "Por favor ingresa el número de teléfono desde el que realizaste el Pago Móvil.";
  }
  if (!receiptImage) {
    return "Por favor adjunta la captura o foto del comprobante de pago.";
  }
  return null;
}
