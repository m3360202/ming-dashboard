<?php

namespace App\Http\Controllers;

use App\Models\AiDataList;
use Illuminate\Http\Request;
use Carbon\Carbon; 

use App\Models\AiData7;
use App\Models\AiData8;
use App\Models\AiData9;

class DataListController extends Controller
{

    public function list(Request $request)
    {

        // 查询pid大于pidStart的数据，并按pid升序排列，返回从pageStart开始的20条数据
        $aiDataList = AiDataList::orderBy('item', 'desc')->get();

        // 返回数据
        return response()->json([
            'success' => true,
            'data' => $aiDataList
        ]);
    }

    public function count(Request $request)
    {

        // 获取日期参数，默认为空
        $startDate = $request->input('startDate', '');
        $endDate = $request->input('endDate', '');
        // 如果日期参数不为空，则根据日期查询数据
        if ($startDate == $endDate) {
            return response()->json([
            'success' => true,
            'total' => [50,100,150] // 总数据量
        ]);
        }
        else{
            //统计AiData 789
            $aiData7 = AiData7::whereDate('add_time', '>=', $startDate)->whereDate('add_time', '<=', $endDate)->get();
            $aiData8 = AiData8::whereDate('add_time', '>=', $startDate)->whereDate('add_time', '<=', $endDate)->get();
            $aiData9 = AiData9::whereDate('add_time', '>=', $startDate)->whereDate('add_time', '<=', $endDate)->get();
            return response()->json([
            'success' => true,
            'total' => [$aiData7->count(),$aiData8->count(),$aiData9->count()] // 总数据量
        ]);
        }
    }
}
