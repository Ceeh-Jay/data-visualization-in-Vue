import type { ChartDataItem } from '@/types/types'

export const fetchChartData = async (): Promise<ChartDataItem[]> => {
  const startDate = '2017-07-01'
  const endDate = '2018-03-07'
  const query = `start=${startDate}&end=${endDate}`

  try {
    const response = await fetch(`https://api.coindesk.com/v1/bpi/historical/close.json?${query}`)
    const {
      bpi
    }: {
      [date: string]: number
    } = await response.json()
    return Object.entries(bpi).map(([key, value]: [string, number]) => ({
      date: new Date(key),
      value
    }))
  } catch (error) {
    console.error('Error fetching data:', error)
    return [] // Handle error gracefully
  }
}
