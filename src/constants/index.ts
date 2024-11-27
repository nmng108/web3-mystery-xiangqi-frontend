import IMGS from './imgs';
import IMAGE_URLS from './imageUrls.ts';
import ICONS from './icons';
import COLORS from './colors';
import ROUTES from './routes';
import LOCAL_STORAGE_KEYS from './localStorageKeys';
import { Piece } from './enumerations.ts';

export { ROUTES, IMGS, IMAGE_URLS, COLORS, ICONS, LOCAL_STORAGE_KEYS };

export * from './enumerations';

export const pieceImageMappings: Map<Piece, string | null> = new Map([
  [Piece.None, null],
  [Piece.General, IMAGE_URLS.PIECE_GENERAL_ICON],
  [Piece.Advisor, IMAGE_URLS.PIECE_ADVISOR_ICON],
  [Piece.Elephant, IMAGE_URLS.PIECE_ELEPHANT_ICON],
  [Piece.Horse, IMAGE_URLS.PIECE_HORSE_ICON],
  [Piece.Chariot, IMAGE_URLS.PIECE_CHARIOT_ICON],
  [Piece.Cannon, IMAGE_URLS.PIECE_CANNON_ICON],
  [Piece.Soldier, IMAGE_URLS.PIECE_SOLDIER_ICON],
]);