export const addCardzipLogo = async (pdf, x, y, width = 12, height = 12) => {
  const response = await fetch('/cardzip-logo.jpg')
  if (!response.ok) throw new Error('Could not load the Cardzip receipt logo.')
  const logo = await response.blob()
  const reader = new FileReader()
  const dataUrl = await new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error('Could not read the Cardzip receipt logo.'))
    reader.readAsDataURL(logo)
  })
  pdf.addImage(dataUrl, 'JPEG', x, y, width, height)
}
