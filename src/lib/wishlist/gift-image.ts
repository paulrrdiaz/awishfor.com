const MANAGED_IMAGE_HOSTS = new Set(["utfs.io"]);

export function isManagedGiftImageUrl(imageUrl: string): boolean {
	try {
		const hostname = new URL(imageUrl).hostname.toLowerCase();
		return MANAGED_IMAGE_HOSTS.has(hostname) || hostname.endsWith(".ufs.sh");
	} catch {
		return false;
	}
}
