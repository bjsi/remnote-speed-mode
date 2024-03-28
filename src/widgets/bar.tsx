import {
  AppEvents,
  QueueInteractionScore,
  WidgetLocation,
  renderWidget,
  useAPIEventListener,
  usePlugin,
  useTracker,
} from '@remnote/plugin-sdk';
import React from 'react';
import {
  autoAnswerDelayKey,
  autoAnswerKey,
  autoShowAnswerDelayKey,
  autoShowAnswerKey,
  defaultAlarmDelay,
  defaultAutoAnswerDelay,
  defaultAutoShowAnswerDelay,
  playAlarmDelayKey,
  playAlarmKey,
} from '../lib/consts';
import clsx from 'clsx';

export function Bar() {
  const plugin = usePlugin();
  const [cardId, setCardId] = React.useState<string | null>(null);
  useTracker(async () => {
    const ctx = await plugin.widget.getWidgetContext<WidgetLocation.QueueBelowTopBar>();
    setCardId(ctx?.cardId || null);
  }, []);

  useAPIEventListener(AppEvents.QueueCompleteCard, undefined, async (e) => {
    setTimeout(async () => {
      const ctx = await plugin.widget.getWidgetContext<WidgetLocation.QueueBelowTopBar>();
      setCardId(ctx?.cardId || null);
    }, 100);
  });

  const playAlarmDelay =
    useTracker(() => plugin.settings.getSetting<number>(playAlarmDelayKey), []) ||
    defaultAlarmDelay;
  const autoShowAnswer = useTracker(
    () => plugin.settings.getSetting<boolean>(autoShowAnswerKey),
    []
  );
  const autoShowAnswerDelay =
    useTracker(() => plugin.settings.getSetting<number>(autoShowAnswerDelayKey), []) ||
    defaultAutoShowAnswerDelay;
  const autoAnswer = useTracker(() => plugin.settings.getSetting<boolean>(autoAnswerKey), []);
  const autoAnswerDelay =
    useTracker(() => plugin.settings.getSetting<number>(autoAnswerDelayKey), []) ||
    defaultAutoAnswerDelay;

  const audioRef = React.useRef<HTMLAudioElement>(null);

  const playAlarm = async () => {
    const shouldPlay = !!(await plugin.settings.getSetting(playAlarmKey));
    if (audioRef.current && shouldPlay) {
      audioRef.current.play();
    }
  };

  const [startTime, setStartTime] = React.useState<number | null>(null);
  const [playedAlarm, setPlayedAlarm] = React.useState(false);
  const [showedAnswer, setShowedAnswer] = React.useState(false);
  const [answered, setAnswered] = React.useState(false);

  React.useEffect(() => {
    const ivl = setInterval(() => {
      const now = Date.now();
      if (!cardId) {
        return;
      } else if (!playedAlarm && startTime && now - startTime > playAlarmDelay * 1000) {
        playAlarm();
        setPlayedAlarm(true);
      } else if (!showedAnswer && startTime && now - startTime > autoShowAnswerDelay * 1000) {
        plugin.queue.showAnswer();
        setShowedAnswer(true);
      } else if (!answered && startTime && now - startTime > autoAnswerDelay * 1000) {
        plugin.queue.rateCurrentCard(QueueInteractionScore.AGAIN);
        setAnswered(true);
      }
    }, 300);
    return () => {
      clearInterval(ivl);
    };
  }, [
    cardId,
    startTime,
    playAlarmDelay,
    autoShowAnswer,
    autoShowAnswerDelay,
    autoAnswer,
    autoAnswerDelay,
    playedAlarm,
    showedAnswer,
  ]);

  React.useEffect(() => {
    if (cardId) {
      setStartTime(Date.now());
      setAnswered(false);
      setPlayedAlarm(false);
      setShowedAnswer(false);
    }
  }, [cardId]);

  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const ivl = setInterval(() => {
      setNow(Date.now());
    }, 10);
    return () => {
      clearInterval(ivl);
    };
  }, []);

  const width = Math.min(100, ((now - (startTime || now)) / (playAlarmDelay * 1000)) * 100);
  return (
    <div className="w-[100%] h-2">
      <div
        className={clsx('h-2 bg-red-50', width === 100 && 'animate-pulse')}
        style={{
          width: `${width}%`,
        }}
      ></div>
      <audio ref={audioRef} src={plugin.rootURL + 'ding.mp3'} />
    </div>
  );
}

renderWidget(Bar);
