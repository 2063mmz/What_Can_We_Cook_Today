# What Can We Cook Today

<a href="#english"><kbd>English</kbd></a>
<a href="#中文版"><kbd>中文版</kbd></a>

## English

Can only think of a few dishes? Not sure what to eat? Do not feel like risking
a completely new recipe? Start building your own recipe book and let it choose
from the food you already know how to make. You probably know more dishes than
you think — pick one, or look for a little inspiration.

**What Can We Cook Today** is a small, browser-based kitchen notebook. Add or
import your recipes, select the ingredients you have, your available time and
the kind of meal you want, then roll the slot machine. The app recommends from
your own collection first. A separate Inspiration page draws from the open
[Wikibooks Cookbook](https://en.wikibooks.org/wiki/Cookbook:Recipes).

The project is built with **React, TypeScript, Vite, HTML and CSS**. Recipes are
stored locally in **IndexedDB**, with a `localStorage` fallback. Wikibooks is the
external recipe corpus, and **MyMemory** automatically translates short recipe
titles and search terms. There is no account and no application server; recipes
can be exported as Markdown or JSON for backup.

```bash
npm install
npm run dev
```

The interface supports English, Chinese and French. English is the default.

## 中文版

会做的菜好像很少？不知道吃什么？也不想冒险尝试一道完全陌生的新菜？那就先建立
自己的菜谱本，再从真正会做的菜里选吧。其实你会做很多菜，选一个，或者去找找灵感。

**今天做什么菜** 是一本保存在浏览器里的个人厨房笔记。你可以添加或导入自己的
菜谱，选择现有食材、时间和用餐类型，再用老虎机从自己的菜谱中选出一道。独立的
「寻找灵感」页面使用开放的
[Wikibooks Cookbook](https://en.wikibooks.org/wiki/Cookbook:Recipes) 国际菜谱库。

项目使用 **React、TypeScript、Vite、HTML 和 CSS**。菜谱优先保存在浏览器的
**IndexedDB** 中，并以 `localStorage` 作为备用存储。外部菜谱语料来自 Wikibooks，
短菜名和搜索词由 **MyMemory** 自动翻译。项目没有账号和应用服务器，也不会上传你的
个人菜谱；你可以随时将菜谱导出为 Markdown 或 JSON 备份。

```bash
npm install
npm run dev
```

界面支持英文、中文和法文，默认显示英文。
