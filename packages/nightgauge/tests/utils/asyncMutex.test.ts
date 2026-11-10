import { describe, it, expect } from "vitest";
import { AsyncMutex } from "../../src/utils/asyncMutex";

describe("AsyncMutex (#414)", () => {
  it("initializes in an unlocked state with an empty queue", () => {
    const mutex = new AsyncMutex();
    expect(mutex.isLocked()).toBe(false);
    expect(mutex.getQueueLength()).toBe(0);
  });

  it("locks on acquire and unlocks on release", async () => {
    const mutex = new AsyncMutex();
    const release = await mutex.acquire();

    expect(mutex.isLocked()).toBe(true);
    expect(mutex.getQueueLength()).toBe(0);

    release();
    expect(mutex.isLocked()).toBe(false);
  });

  it("serializes concurrent access in FIFO order", async () => {
    const mutex = new AsyncMutex();
    const executionOrder: number[] = [];

    const task1 = mutex.runExclusive(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      executionOrder.push(1);
      return "one";
    });

    const task2 = mutex.runExclusive(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      executionOrder.push(2);
      return "two";
    });

    const task3 = mutex.runExclusive(async () => {
      executionOrder.push(3);
      return "three";
    });

    expect(mutex.getQueueLength()).toBe(2);

    const results = await Promise.all([task1, task2, task3]);
    expect(results).toEqual(["one", "two", "three"]);
    expect(executionOrder).toEqual([1, 2, 3]);
    expect(mutex.isLocked()).toBe(false);
    expect(mutex.getQueueLength()).toBe(0);
  });

  it("releases the lock when runExclusive throws", async () => {
    const mutex = new AsyncMutex();

    await expect(
      mutex.runExclusive(async () => {
        throw new Error("task failed");
      })
    ).rejects.toThrow("task failed");

    expect(mutex.isLocked()).toBe(false);

    // Ensure next task can acquire immediately
    const result = await mutex.runExclusive(async () => "recovered");
    expect(result).toBe("recovered");
  });

  it("protects shared state against race conditions under high concurrency", async () => {
    const mutex = new AsyncMutex();
    let counter = 0;
    const taskCount = 50;

    const tasks = Array.from({ length: taskCount }, () =>
      mutex.runExclusive(async () => {
        const current = counter;
        await new Promise((resolve) => setTimeout(resolve, 1));
        counter = current + 1;
      })
    );

    await Promise.all(tasks);
    expect(counter).toBe(taskCount);
    expect(mutex.isLocked()).toBe(false);
  });
});
