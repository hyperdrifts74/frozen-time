import type { ImageSourcePropType } from 'react-native';

/**
 * Codex fixed asset contract — these file names are the ONLY ones that exist.
 * Never invent another name.
 */
export const ASSETS = {
  bgGame: require('../../assets/bg_game.png') as ImageSourcePropType,
  logo: require('../../assets/logo.png') as ImageSourcePropType,
  iconHome: require('../../assets/icon_home.png') as ImageSourcePropType,
  iconPause: require('../../assets/icon_pause.png') as ImageSourcePropType,
  buttonRect: require('../../assets/button_rect.png') as ImageSourcePropType,
  buttonRound: require('../../assets/button_round.png') as ImageSourcePropType,
  sprite1: require('../../assets/sprite_1.png') as ImageSourcePropType,
  sprite2: require('../../assets/sprite_2.png') as ImageSourcePropType,
  sprite3: require('../../assets/sprite_3.png') as ImageSourcePropType,
  sprite4: require('../../assets/sprite_4.png') as ImageSourcePropType,
  sprite5: require('../../assets/sprite_5.png') as ImageSourcePropType,
};

/** sprite_1..sprite_5 are the five species, indexed by species id 1..5. */
export const SPRITES: ImageSourcePropType[] = [
  ASSETS.sprite1,
  ASSETS.sprite2,
  ASSETS.sprite3,
  ASSETS.sprite4,
  ASSETS.sprite5,
];

export function spriteFor(speciesId: number): ImageSourcePropType {
  const i = Math.min(Math.max(speciesId, 1), SPRITES.length) - 1;
  return SPRITES[i];
}
