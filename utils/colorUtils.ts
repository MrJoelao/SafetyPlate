export const getScoreColor = (score: number) => {
  if (score <= 40) return "#F44336" // red for low scores
  if (score < 70) return "#FFC107" // yellow for medium scores
  return "#4CAF50" // green for high scores
}

export const withOpacity = (color: string, opacity: number) => {
  // Convert opacity (0-100) to hex (00-FF)
  const hex = Math.round((opacity / 100) * 255).toString(16).padStart(2, "0")
  return `${color}${hex}`
}
