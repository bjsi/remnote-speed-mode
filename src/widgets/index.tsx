import { declareIndexPlugin, ReactRNPlugin, WidgetLocation } from '@remnote/plugin-sdk';
import '../style.css';
import '../App.css';
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

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.settings.registerBooleanSetting({
    id: playAlarmKey,
    title: 'Play alarm',
    defaultValue: true,
  });

  await plugin.settings.registerNumberSetting({
    id: playAlarmDelayKey,
    title: 'Play alarm after (seconds)',
    defaultValue: defaultAlarmDelay,
  });

  await plugin.settings.registerBooleanSetting({
    id: autoShowAnswerKey,
    title: 'Auto show answer',
    defaultValue: false,
  });

  await plugin.settings.registerNumberSetting({
    id: autoShowAnswerDelayKey,
    title: 'Auto show answer after (seconds)',
    defaultValue: defaultAutoShowAnswerDelay,
  });

  await plugin.settings.registerBooleanSetting({
    id: autoAnswerKey,
    title: 'Auto answer',
    defaultValue: false,
  });

  await plugin.settings.registerNumberSetting({
    id: autoAnswerDelayKey,
    title: 'Auto answer after (seconds)',
    defaultValue: defaultAutoAnswerDelay,
  });

  await plugin.app.registerWidget('bar', WidgetLocation.QueueBelowTopBar, {
    dimensions: { height: 'auto', width: '100%' },
  });
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
