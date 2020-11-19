import ms from 'ms'

import { Counts, Plugin, SortKey } from './types'
import { fetchHistoricalPluginStatsAsync } from './utilities/fetch-historical-plugin-stats-async'
import { fetchLivePluginsDataAsync } from './utilities/fetch-live-plugins-data-async'
import { parseData } from './utilities/parse-data'
import { sortComparators } from './utilities/sort-comparators'

export async function fetchFigmaPluginsStatsAsync({
  handle,
  limit,
  sort,
  timeOffset
}: {
  handle: null | string
  limit: number
  sort: SortKey
  timeOffset: string
}): Promise<{
  endDate: Date
  plugins: Array<Plugin>
  startDate: Date
  totals: Counts
}> {
  const timeOffsetInMilliseconds = ms(timeOffset)
  if (timeOffsetInMilliseconds < ms('1d')) {
    throw new Error('Time offset must be at least 1 day (`1d`)')
  }
  const endDate = new Date()
  const livePluginsData = await fetchLivePluginsDataAsync()
  const { startDate, stats } = await fetchHistoricalPluginStatsAsync(
    endDate,
    timeOffsetInMilliseconds
  )
  const { plugins, totals } = parseData(livePluginsData, stats, {
    handle,
    limit,
    sortComparator: sortComparators[sort]
  })
  if (plugins.length === 0) {
    throw new Error(`User \`${handle}\` has no public plugins`)
  }
  return {
    endDate,
    plugins,
    startDate,
    totals
  }
}
