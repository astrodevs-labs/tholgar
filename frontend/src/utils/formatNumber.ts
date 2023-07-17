export default function formatNumber(num: string) {
  return num.split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
