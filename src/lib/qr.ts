import QRCode from "qrcode";

export const createQrCodeDataUrl = async (text: string) =>
	QRCode.toDataURL(text, {
		margin: 2,
		width: 1024,
	});

export const downloadQrCodePng = async ({
	text,
	fileName,
}: {
	text: string;
	fileName: string;
}) => {
	const dataUrl = await createQrCodeDataUrl(text);
	const link = document.createElement("a");
	link.href = dataUrl;
	link.download = fileName;
	link.click();
};
