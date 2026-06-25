<?php

namespace App\Enum;

enum Category: string
{
    case Entertainment = 'entertainment';
    case Music = 'music';
    case WorkTools = 'work_tools';
    case Other = 'other';
}
