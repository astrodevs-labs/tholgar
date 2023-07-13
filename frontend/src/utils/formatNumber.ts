export default function formatNumber(num: string) {
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
