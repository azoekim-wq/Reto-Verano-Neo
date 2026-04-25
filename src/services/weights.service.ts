// @deprecated — El schema real usa un array embebido `weeklyData` dentro de cada
// participante, no una colección independiente de pesadas. Usa participants.service
// en su lugar. Este fichero se mantiene como shim para evitar imports rotos.

export {
  listParticipants,
  getParticipant,
  addWeeklyEntry,
  replaceWeeklyData,
  latestEntry,
  startEntry,
  deltaPct,
  streakWeeks,
} from './participants.service';
