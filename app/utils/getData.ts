export async function getGastosData(year: string, month: string) {
  try {
    const response = await fetch(`/data/gastos.json`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();
    return data[year]?.[month] || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}