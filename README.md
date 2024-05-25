This is a site for learning English language.

## How to use

1. Take a quick test to determine your English level. 
2. Track your list of known words starting from this level.
3. Choose an English content you want to watch and upload .srt subtitles of it. The site will filter words you already know and show you new words to learn. Learn this new words and add them to your vocabulary, for best results use [Anki](https://apps.ankiweb.net/). Watch the content for fun!

## Technical details

### Oxford's wordlist

[Oxford's 5000 wordlist](https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000) is a big part of the app. In this list each word has it's difficulty or level. One of main goals of the site is to make the user learn this list. If you've learned it you're breathtaking, your level of English has increased drastically and our job here is done. 

The list used in the English test and as a base of the user's vocabulary. For example if the user is rated as B1 they can add all B1 level words and below from the Oxford's list to their vocabulary and most likely the user will know most of the words in their list. 

The admin of the site can adjust difficulties of the words in the admin panel. Although Oxford's scholars have made a good job rating the words, the ratings are not quite ideal. 

### The English test

The main idea of the test is - if you are X level there is no way you don't know a single X level word. 

When taking the test you start from C2 level. You can give a correct answer, a wrong answer or press "I don't know" button. 

In order to complete the test you have to give 5 correct answers. If you give 5 correct answers from the start you'll be rated as C2 or an English native.

If you press "I don't know" your level decrements. You'll be receiving easier questions and your rating will be lower.

If you give a wrong answer your level decrements and all previous correct answers are considered guessed and burn. 

For example you can give 2 correct answers in C2 section, press "I don't know", give 3 correct answers in C1 section and you'll be rated as C1. 
If you give 2 correct answers in C2 section and make a mistake, now you have to give 5 correct answers in C1 section in order to achive C1 level.

If you fail one question in A1 section you'll fail the test. 

### The text lemmatizer

The purpose of the lemmatizer is to convert given text into a list of words the user can learn. E.g. if you learn thw word "dog" you don't need to learn the word "dogs", this way if we meet the word "dogs" we take it lemma "dog". Then we can filter the words which the user already knows and show the list to the user.

I made the lemmatizer myself because I'd tried different lemmatizers and they hadn't fit. It takes list of all English words and filters them with the lemmatizer algorythm. This way we get a list of all English lemmas. Then we can adjust it with the blacklist, the whitelist and the overrides list. 

1. Whitelist says that this is an English word a student can learn. Oxford's list is whitelisted. 
2. Blacklist says that this word isn't English or not a lemma. 
3. Overrides are used for irregular verbs and rare cases. 

When the user uploads .srt and works with the new words list, they can suggest corrections to the lemmatizer, namely press "this is not an English word" or "this word is a form of another word". Admins then can edit the whitelist, the blacklist and the overrides in order to correct the lemmatiizer behaviour.