
import React from 'react';
import { BaseCharacterLogic } from '../logic_Interface';
import { UIContext, SetupContext, Player } from '../../game/core/types';

// Helper Component for Setup
const TimeTravelerSetup: React.FC<UIContext> = (context) => {
  const [gold, setGold] = React.useState<string | null>(null);
  const [black1, setBlack1] = React.useState<string | null>(null);
  const [black2, setBlack2] = React.useState<string | null>(null);

  const players = ['p1', 'p2', 'p3']; // Assuming 3 players

  const handleConfirm = () => {
    if (gold && black1 && black2) {
      context.performAction('TIME_TRAVEL_PREDICT', { gold, black1, black2 });
    }
  };

  return React.createElement("div", { className: "p-4 bg-purple-900/95 rounded-xl space-y-4 text-white border border-purple-500 shadow-xl max-w-lg mx-auto" },
    React.createElement("h3", { className: "font-bold text-lg text-center text-purple-300" }, "Visiones del Futuro"),
    React.createElement("p", { className: "text-xs text-center text-gray-300" }, "Predice el destino de la ronda para ganar puntos extra."),

    // Gold Selection
    React.createElement("div", { className: "space-y-1" },
      React.createElement("label", { className: "text-xs font-bold text-yellow-400" }, "Corona Dorada (Más Victorias):"),
      React.createElement("div", { className: "flex gap-2 justify-center" },
        players.map(pid => React.createElement("button", {
          key: `gold-${pid}`,
          onClick: () => setGold(pid),
          className: `px-3 py-1 rounded text-xs transition-colors ${gold === pid ? 'bg-yellow-500 text-black font-bold' : 'bg-slate-700 hover:bg-slate-600'}`
        }, pid === 'p1' ? 'Yo' : `Rival ${pid.replace('p', '')}`))
      )
    ),

    // Black 1 Selection
    React.createElement("div", { className: "space-y-1" },
      React.createElement("label", { className: "text-xs font-bold text-gray-400" }, "Corona Negra 1 (0 Victorias / Resistencia):"),
      React.createElement("div", { className: "flex gap-2 justify-center" },
        players.map(pid => React.createElement("button", {
          key: `black1-${pid}`,
          onClick: () => setBlack1(pid),
          className: `px-3 py-1 rounded text-xs transition-colors ${black1 === pid ? 'bg-gray-600 text-white font-bold ring-1 ring-white' : 'bg-slate-700 hover:bg-slate-600'}`
        }, pid === 'p1' ? 'Yo' : `Rival ${pid.replace('p', '')}`))
      )
    ),

    // Black 2 Selection
    React.createElement("div", { className: "space-y-1" },
      React.createElement("label", { className: "text-xs font-bold text-gray-400" }, "Corona Negra 2:"),
      React.createElement("div", { className: "flex gap-2 justify-center" },
        players.map(pid => React.createElement("button", {
          key: `black2-${pid}`,
          onClick: () => setBlack2(pid),
          className: `px-3 py-1 rounded text-xs transition-colors ${black2 === pid ? 'bg-gray-600 text-white font-bold ring-1 ring-white' : 'bg-slate-700 hover:bg-slate-600'}`
        }, pid === 'p1' ? 'Yo' : `Rival ${pid.replace('p', '')}`))
      )
    ),

    React.createElement("div", { className: "pt-2 flex justify-center" },
      React.createElement("button", {
        disabled: !gold || !black1 || !black2,
        onClick: handleConfirm,
        className: `btn btn-purple w-full ${(!gold || !black1 || !black2) ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}`
      }, "CONFIRMAR PREDICCIÓN")
    )
  );
};

export class TimeTravelerLogic extends BaseCharacterLogic {
  setup(context: SetupContext): Partial<Player> {
    return {
      ...super.setup(context),
      timeTravelTokens: 2,
      timeTravelPredictions: []
    };
  }
  renderActions(context: UIContext): React.ReactNode {
    const { isCurrentPlayer, performAction, playedCards, player, abilityMode, selectedCards } = context;
    if (!isCurrentPlayer || !player) return null;

    // 1. Setup Phase: Predictions
    if (abilityMode === 'TIME_TRAVELER_SETUP') {
      return React.createElement(TimeTravelerSetup, context);
    }

    // 2. Win Choice: Change the Past?
    if (abilityMode === 'TIME_TRAVEL_WIN_CHOICE') {
      return React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50" },
        React.createElement("div", { className: "bg-slate-900 p-6 rounded-xl border border-purple-500 shadow-2xl max-w-md w-full" },
          React.createElement("h3", { className: "text-xl font-bold text-purple-400 mb-4" }, "Interferir en el Tiempo"),
          React.createElement("p", { className: "text-white mb-6" },
            "Has ganado la baza. ¿Deseas usar 'Cambiar el Pasado'? " +
            "(Tomarás todas las cartas y las redistribuirás. Coste: 1 Token)."
          ),
          React.createElement("div", { className: "flex justify-end gap-3" },
            React.createElement("button", {
              className: "px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white",
              onClick: () => performAction('COMPLETE_TRICK_NORMAL') // Skip
            }, "No, resolver normal"),
            React.createElement("button", {
              className: "px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white font-bold shadow-lg shadow-purple-500/20",
              onClick: () => performAction('TIME_TRAVEL_CHANGE_PAST')
            }, "Sí, cambiar el pasado")
          )
        )
      );
    }

    // 3. Distribution Phase
    if (abilityMode === 'TIME_TRAVEL_DISTRIBUTE') {
      // User must assign cards from hand to opponents?
      // Or just select cards to GIVE to opponents?
      // Logic: P1 took 3-4 cards. Hand is large.
      // Must give 1 card to P2, 1 card to P3?
      // Or distribute arbitrarily?
      // Rules: "Redistribute the cards among the players."
      // Let's assume we select a card, then select a target.
      // UI needs to support this.
      // Simplified: Select Card -> Opens Target Menu?
      return React.createElement("div", { className: "fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900/90 p-4 rounded-xl border border-purple-500/50 text-white z-50" },
        React.createElement("h3", { className: "font-bold text-purple-300" }, "Redistribución Temporal"),
        React.createElement("p", { className: "text-sm mb-2" }, "Selecciona cartas de tu mano para dar a los rivales."),
        // Logic for distribution is complex. We rely on card selection + action?
        // Maybe just instructions here, and handled by clicking cards?
        // If selectedCards.length > 0
        selectedCards.length > 0 ?
          React.createElement("div", { className: "flex gap-2 mt-2" },
            React.createElement("span", {}, "Dar a:"),
            React.createElement("button", {
              className: "btn btn-blue text-xs",
              onClick: () => performAction('TIME_TRAVEL_EXECUTE_DISTRIBUTION', { [selectedCards[0]]: 'p2' })
            }, "Rival 1"),
            React.createElement("button", {
              className: "btn btn-green text-xs",
              onClick: () => performAction('TIME_TRAVEL_EXECUTE_DISTRIBUTION', { [selectedCards[0]]: 'p3' })
            }, "Rival 2")
          ) : React.createElement("p", { className: "text-xs text-gray-400 italic" }, "Haz clic en una carta de tu mano.")
      );
    }

    // 4. Rewind Ability (During Play)
    if (playedCards.length > 0 && player.timeTravelTokens > 0 && abilityMode === 'NONE') {
      return (
        React.createElement("button", {
          onClick: () => performAction('TIME_TRAVEL_REWIND'),
          className: "btn btn-purple !py-2 !px-6 shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
        }, "REBOBINAR TIEMPO")
      );
    }

    return null;
  }
}
