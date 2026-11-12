import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import CollectionScreen from './src/screens/CollectionScreen';
import GameScreen from './src/screens/GameScreen';
import LevelSelectScreen from './src/screens/LevelSelectScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ResultScreen, { ResultPayload } from './src/screens/ResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { THEME } from './src/constants/theme';
import { progressStore } from './src/game/progressStore';
import { clampToUnlocked } from './src/game/spots';
import { useProgress } from './src/hooks/useProgress';
import { SceneResult } from './src/hooks/useScene';

type Screen =
  | 'loader'
  | 'menu'
  | 'levels'
  | 'game'
  | 'result'
  | 'collection'
  | 'progress'
  | 'settings';

/** App.tsx owns the screen state machine only — no gameplay lives here. */
function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [run, setRun] = useState({ spot: 0, attempt: 1 });
  const [result, setResult] = useState<ResultPayload | null>(null);
  const { data, setSweep, setAssist, setLastSpot, resetAll } = useProgress();

  const fade = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(0)).current;
  const screenRef = useRef<Screen>('loader');
  screenRef.current = screen;

  const go = useCallback(
    (next: Screen) => {
      if (screenRef.current === next) {
        return;
      }
      Animated.timing(fade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setScreen(next);
        rise.setValue(12);
        Animated.parallel([
          Animated.timing(fade, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(rise, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [fade, rise],
  );

  // Forward navigation pushes; system Back returns to Menu, Back on Menu exits.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const cur = screenRef.current;
      if (cur === 'menu' || cur === 'loader') {
        return false;
      }
      go('menu');
      return true;
    });
    return () => sub.remove();
  }, [go]);

  const startSpot = useCallback(
    (spotIndex: number) => {
      setRun(prev => ({
        spot: spotIndex,
        attempt: prev.spot === spotIndex ? prev.attempt + 1 : 1,
      }));
      setLastSpot(spotIndex);
      go('game');
    },
    [go, setLastSpot],
  );

  const handlePlay = useCallback(() => {
    startSpot(clampToUnlocked(data.lastSpot, data.totalCatches));
  }, [data.lastSpot, data.totalCatches, startSpot]);

  const handleAgain = useCallback(() => {
    setRun(prev => ({ spot: prev.spot, attempt: prev.attempt + 1 }));
    go('game');
  }, [go]);

  const handleGameOver = useCallback(
    (scene: SceneResult) => {
      const extras = progressStore.applySceneResult({
        spotIndex: scene.spotIndex,
        score: scene.score,
        bestStreak: scene.bestStreak,
        freezesUsed: scene.freezesUsed,
        catches: scene.catches,
      });
      setResult({ ...scene, ...extras });
      go('result');
    },
    [go],
  );

  const handleMenu = useCallback(() => go('menu'), [go]);

  const handleReset = useCallback(() => {
    resetAll();
    setRun({ spot: 0, attempt: 1 });
    setResult(null);
    go('menu');
  }, [go, resetAll]);

  let body: React.ReactNode = null;
  if (screen === 'loader') {
    body = <LoaderScreen onDone={handleMenu} />;
  } else if (screen === 'menu') {
    body = (
      <MenuScreen
        data={data}
        onPlay={handlePlay}
        onLevels={() => go('levels')}
        onCollection={() => go('collection')}
        onProgress={() => go('progress')}
        onSettings={() => go('settings')}
      />
    );
  } else if (screen === 'levels') {
    body = (
      <LevelSelectScreen
        data={data}
        onBack={handleMenu}
        onStart={startSpot}
      />
    );
  } else if (screen === 'game') {
    body = (
      <GameScreen
        key={'scene-' + run.spot + '-' + run.attempt}
        spotIndex={run.spot}
        attempt={run.attempt}
        sweep={data.sweep}
        assist={data.assist}
        onGameOver={handleGameOver}
        onMenu={handleMenu}
      />
    );
  } else if (screen === 'result' && result) {
    body = (
      <ResultScreen
        result={result}
        onAgain={handleAgain}
        onMenu={handleMenu}
        onCollection={() => go('collection')}
      />
    );
  } else if (screen === 'collection') {
    body = <CollectionScreen data={data} onBack={handleMenu} />;
  } else if (screen === 'progress') {
    body = <ProgressScreen data={data} onBack={handleMenu} />;
  } else if (screen === 'settings') {
    body = (
      <SettingsScreen
        data={data}
        onBack={handleMenu}
        onSweep={setSweep}
        onAssist={setAssist}
        onReset={handleReset}
      />
    );
  } else {
    body = (
      <MenuScreen
        data={data}
        onPlay={handlePlay}
        onLevels={() => go('levels')}
        onCollection={() => go('collection')}
        onProgress={() => go('progress')}
        onSettings={() => go('settings')}
      />
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.screen,
          { opacity: fade, transform: [{ translateY: rise }] },
        ]}>
        {body}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.water1 },
  screen: { flex: 1 },
});

export default App;
