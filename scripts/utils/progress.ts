import logUpdate from "log-update";

export type Progress = {
  /** 進捗行を1行で更新表示する（非TTY環境では何もしない）。 */
  update: (line: string) => void;
  /** 進捗表示を確定し、任意で最終行を表示する。 */
  done: (line?: string) => void;
};

/**
 * log-update を使って1行更新型の進捗表示を行う。
 * パイプ出力やCIなど非TTY環境ではログが散らからないよう更新表示は抑制し、
 * 最終サマリ（done）だけを表示する。
 */
export function createProgress(): Progress {
  const isTTY = Boolean(process.stdout.isTTY);

  if (!isTTY) {
    return {
      update: () => {},
      done: (line) => {
        if (line) console.log(line);
      },
    };
  }

  return {
    update: (line) => logUpdate(line),
    done: (line) => {
      if (line) logUpdate(line);
      else logUpdate.clear();
      logUpdate.done();
    },
  };
}
