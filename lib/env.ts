/**
 * Environment configuration utilities
 * Handles dynamic theming and branding from environment variables
 */

// Logo URL - defaults to local logo if not set
export function getLogoUrl(): string {
    return process.env.LOGO_URL || "/movistar-logo.png"
}

// Primary color in hex format (e.g., "#0B6CFF")
export function getPrimaryColor(): string {
    const color = process.env.PRIMARY_COLOR || "#0B6CFF"
    // Ensure it starts with #
    return color.startsWith("#") ? color : `#${color}`
}

// Generate a darker shade of the primary color for gradients
export function getPrimaryColorDark(): string {
    const primary = getPrimaryColor()
    return adjustBrightness(primary, -20)
}

// Helper to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + percent))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

// Convert hex to RGB for CSS custom properties
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 11, g: 108, b: 255 } // Default blue
}
