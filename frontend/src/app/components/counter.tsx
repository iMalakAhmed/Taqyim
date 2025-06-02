"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  increment,
  decrement,
  incrementByAmount,
} from "../redux/slices/counter/counterSlice";

export default function Counter() {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch();
  return (
    <div className="flex flex-col items-center gap-2">
      <button className="p-2" onClick={() => dispatch(increment())}>
        Increment
      </button>
      <span className="text-xl">{count}</span>
      <button className="p-2" onClick={() => dispatch(decrement())}>
        Decrement
      </button>
      <button className="p-2" onClick={() => dispatch(incrementByAmount(2))}>
        Increment by Amount
      </button>
    </div>
  );
}
